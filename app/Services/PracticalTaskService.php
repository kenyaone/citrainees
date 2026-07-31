<?php

namespace App\Services;

use App\Models\Skill;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PracticalTaskService
{
    /**
     * Generate a Kenya-context practical task + rubric for a skill.
     * Returns ['task_prompt' => string, 'rubric' => array<{criterion: string, weight: int}>, 'follow_up_question' => string].
     */
    public function generate(Skill $skill): array
    {
        $this->requireApiKey();

        $response = $this->callClaude(
            system: $this->generateSystemPrompt(),
            user: $this->generateUserPrompt($skill),
            schema: $this->generateSchema(),
        );

        $data = $this->parseJsonResponse($response);

        if (empty($data['task_prompt']) || empty($data['rubric']) || empty($data['follow_up_question'])) {
            throw new RuntimeException('Malformed task response from Claude: '.json_encode($data));
        }

        return [
            'task_prompt' => $data['task_prompt'],
            'rubric' => $data['rubric'],
            'follow_up_question' => $data['follow_up_question'],
        ];
    }

    /**
     * Grade a submission against the rubric. Also flags AI-generated confidence.
     * Returns ['score' => 0-100, 'feedback' => [criterion => note], 'ai_generated_flag' => low|medium|high, 'summary' => string].
     */
    public function grade(string $taskPrompt, array $rubric, string $submission, ?string $voiceTranscript = null): array
    {
        $this->requireApiKey();

        $response = $this->callClaude(
            system: $this->gradeSystemPrompt(),
            user: $this->gradeUserPrompt($taskPrompt, $rubric, $submission, $voiceTranscript),
            schema: $this->gradeSchema(),
        );

        $data = $this->parseJsonResponse($response);

        if (! isset($data['score']) || ! isset($data['ai_generated_flag'])) {
            throw new RuntimeException('Malformed grading response from Claude: '.json_encode($data));
        }

        $score = (int) max(0, min(100, $data['score']));
        $flag = in_array($data['ai_generated_flag'], ['low', 'medium', 'high'], true)
            ? $data['ai_generated_flag']
            : 'medium';

        return [
            'score' => $score,
            'feedback' => $data['feedback'] ?? [],
            'ai_generated_flag' => $flag,
            'summary' => $data['summary'] ?? '',
        ];
    }

    private function requireApiKey(): void
    {
        if (empty(config('assessments.ai.api_key'))) {
            throw new RuntimeException('ANTHROPIC_API_KEY is not set in .env.');
        }
    }

    private function callClaude(string $system, string $user, array $schema): array
    {
        $response = Http::withHeaders([
            'x-api-key' => config('assessments.ai.api_key'),
            'anthropic-version' => config('assessments.ai.api_version'),
            'content-type' => 'application/json',
        ])
            ->timeout(config('assessments.ai.timeout_seconds'))
            ->post(config('assessments.ai.endpoint'), [
                'model' => config('assessments.ai.model'),
                'max_tokens' => config('assessments.ai.max_tokens'),
                'system' => $system,
                'messages' => [['role' => 'user', 'content' => $user]],
                'output_config' => [
                    'format' => ['type' => 'json_schema', 'schema' => $schema],
                ],
            ]);

        if ($response->failed()) {
            $body = $response->json();
            throw new RuntimeException('Claude API error: '.($body['error']['message'] ?? $response->body()));
        }

        return $response->json();
    }

    private function parseJsonResponse(array $response): array
    {
        $text = '';
        foreach ($response['content'] ?? [] as $block) {
            if (($block['type'] ?? '') === 'text') {
                $text .= $block['text'];
            }
        }
        return json_decode($text, true, flags: JSON_THROW_ON_ERROR);
    }

    private function generateSystemPrompt(): string
    {
        return <<<PROMPT
        You are an assessor creating a 15-minute practical task for Compassion International Kenya alumni to demonstrate a skill they learned informally (self-taught, YouTube, on-the-job, non-accredited).

        Your task must:
        - Be answerable in 200-400 words of text.
        - Reference a specific Kenyan context: a named town/county (Nakuru, Kisumu, Eldoret, Mombasa, Nairobi neighbourhoods, etc.), a local business type, KSh amounts, Kenyan cultural details, or Swahili/Sheng phrasing where natural.
        - Be practical and applied — not theoretical. Test what the person can DO, not what they can define.
        - Be answerable without external tools or references. No "look up X" instructions.
        - Be specific enough that the same task from Google or ChatGPT would need heavy adaptation.

        Rubric: 5 criteria, each worth 20 points, totalling 100. Criteria should assess concrete outcomes visible in the response (e.g. "identifies target audience clearly", "uses at least 3 realistic cost estimates in KSh"), not vague qualities like "quality" or "creativity".

        Follow-up question: one short question (10-20 words) the alumnus will answer in a 30-second voice recording after passing. It should require them to explain a specific choice they made in their submission — hard to fake if they didn't do it themselves.
        PROMPT;
    }

    private function generateUserPrompt(Skill $skill): string
    {
        $category = $skill->category ? " (category: {$skill->category})" : '';
        return "Generate a practical task, rubric, and voice follow-up question for the skill: **{$skill->name}**{$category}.";
    }

    private function generateSchema(): array
    {
        return [
            'type' => 'object',
            'required' => ['task_prompt', 'rubric', 'follow_up_question'],
            'properties' => [
                'task_prompt' => ['type' => 'string'],
                'rubric' => [
                    'type' => 'array',
                    'minItems' => 5,
                    'maxItems' => 5,
                    'items' => [
                        'type' => 'object',
                        'required' => ['criterion', 'weight'],
                        'properties' => [
                            'criterion' => ['type' => 'string'],
                            'weight' => ['type' => 'integer'],
                        ],
                    ],
                ],
                'follow_up_question' => ['type' => 'string'],
            ],
        ];
    }

    private function gradeSystemPrompt(): string
    {
        return <<<PROMPT
        You are grading a practical task submission for Compassion International Kenya alumni.

        For each rubric criterion, score 0-20 based on how well the submission meets it. Give a one-sentence note per criterion.

        Then flag whether the response reads as AI-generated:
        - "low": clearly human, includes personal anecdotes, local specifics, natural imperfections, first-person specifics.
        - "medium": possibly AI or possibly a polished human — hedged wording, generic examples, safe structure.
        - "high": strong AI markers — em-dashes everywhere, "delve into" / "in today's fast-paced world" phrasing, no local specifics, evenly weighted paragraphs, no first-hand detail.

        The voice-note follow-up transcript (if provided) is critical: if it doesn't match the tone/knowledge of the written submission, flag high.

        Return total score as sum of criterion scores (max 100).
        PROMPT;
    }

    private function gradeUserPrompt(string $taskPrompt, array $rubric, string $submission, ?string $voiceTranscript): string
    {
        $rubricText = '';
        foreach ($rubric as $i => $r) {
            $n = $i + 1;
            $rubricText .= "  {$n}. {$r['criterion']} (worth {$r['weight']} pts)\n";
        }
        $voiceLine = $voiceTranscript
            ? "\n\n**Voice follow-up transcript:**\n{$voiceTranscript}\n"
            : "\n(No voice transcript provided.)\n";

        return <<<PROMPT
        **Task given to alumnus:**
        {$taskPrompt}

        **Rubric:**
        {$rubricText}
        **Written submission:**
        {$submission}
        {$voiceLine}
        Score against the rubric and flag AI-generated risk.
        PROMPT;
    }

    private function gradeSchema(): array
    {
        return [
            'type' => 'object',
            'required' => ['score', 'feedback', 'ai_generated_flag', 'summary'],
            'properties' => [
                'score' => ['type' => 'integer'],
                'feedback' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'required' => ['criterion', 'points', 'note'],
                        'properties' => [
                            'criterion' => ['type' => 'string'],
                            'points' => ['type' => 'integer'],
                            'note' => ['type' => 'string'],
                        ],
                    ],
                ],
                'ai_generated_flag' => [
                    'type' => 'string',
                    'enum' => ['low', 'medium', 'high'],
                ],
                'summary' => ['type' => 'string'],
            ],
        ];
    }
}
