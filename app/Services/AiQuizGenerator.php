<?php

namespace App\Services;

use App\Models\Skill;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiQuizGenerator
{
    public function generate(Skill $skill, int $questionCount = 10): array
    {
        $this->guardRegulated($skill);

        $apiKey = config('assessments.ai.api_key');
        if (empty($apiKey)) {
            throw new RuntimeException('ANTHROPIC_API_KEY is not set in .env. Cannot generate quiz drafts.');
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => config('assessments.ai.api_version'),
            'content-type' => 'application/json',
        ])
            ->timeout(config('assessments.ai.timeout_seconds'))
            ->post(config('assessments.ai.endpoint'), [
                'model' => config('assessments.ai.model'),
                'max_tokens' => config('assessments.ai.max_tokens'),
                'system' => $this->systemPrompt(),
                'messages' => [
                    ['role' => 'user', 'content' => $this->userPrompt($skill, $questionCount)],
                ],
                'output_config' => [
                    'format' => [
                        'type' => 'json_schema',
                        'schema' => $this->outputSchema(),
                    ],
                ],
            ]);

        if ($response->failed()) {
            $body = $response->json();
            $message = $body['error']['message'] ?? $response->body();
            throw new RuntimeException("Claude API error (HTTP {$response->status()}): {$message}");
        }

        $text = $this->extractText($response->json());
        $parsed = json_decode($text, true, flags: JSON_THROW_ON_ERROR);

        if (! isset($parsed['questions']) || ! is_array($parsed['questions'])) {
            throw new RuntimeException("Model response missing 'questions' array. Got: {$text}");
        }

        return array_map(fn ($q) => $this->normalizeQuestion($q), $parsed['questions']);
    }

    private function guardRegulated(Skill $skill): void
    {
        $blocklist = config('assessments.regulated_skill_slugs', []);
        if (in_array($skill->slug, $blocklist, true)) {
            throw new RuntimeException(
                "Skill '{$skill->name}' is on the regulated-skills blocklist — AI generation is disabled. Use certificate upload or manual authoring for this skill."
            );
        }
    }

    private function systemPrompt(): string
    {
        return <<<PROMPT
        You are an expert educational content creator writing skill-assessment multiple-choice questions for Compassion International Kenya alumni. Your audience is Kenyan young adults (18-30) with post-Form Four vocational or academic training, applying for entry-level to mid-level jobs.

        Quality bar for each question:
        - Test practical, applied knowledge — not trivia or definitions.
        - Use scenarios and contexts that are culturally appropriate for a Kenyan workplace (mentioning KSh, Kenyan cities, common Kenyan employers or industries when relevant).
        - Exactly one option must be unambiguously correct. Distractors must be plausible-but-wrong — no obvious dud options like "None of the above" or joke answers.
        - Keep each question and each option under 25 words.
        - Explanation must be one sentence and explain WHY the correct answer is right, not just restate it.
        - Vary difficulty: roughly 3 easier, 4 medium, 3 harder questions in a 10-question set.
        - No jargon that would exclude a self-taught learner unless the skill itself is inherently technical.

        Return exactly the requested number of questions. Never include a question you're not confident about — quality over quantity.
        PROMPT;
    }

    private function userPrompt(Skill $skill, int $count): string
    {
        $category = $skill->category ?? 'General';
        return "Generate {$count} multiple-choice assessment questions for the skill: {$skill->name}\nCategory: {$category}\n\nEach question must have exactly 4 options.";
    }

    private function outputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'questions' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'question' => ['type' => 'string'],
                            'options' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                            ],
                            'correct_index' => [
                                'type' => 'integer',
                                'enum' => [0, 1, 2, 3],
                            ],
                            'explanation' => ['type' => 'string'],
                        ],
                        'required' => ['question', 'options', 'correct_index', 'explanation'],
                        'additionalProperties' => false,
                    ],
                ],
            ],
            'required' => ['questions'],
            'additionalProperties' => false,
        ];
    }

    private function extractText(array $body): string
    {
        foreach ($body['content'] ?? [] as $block) {
            if (($block['type'] ?? null) === 'text') {
                return $block['text'] ?? '';
            }
        }
        throw new RuntimeException('No text block found in Claude API response: '.json_encode($body));
    }

    private function normalizeQuestion(array $q): array
    {
        if (! isset($q['question'], $q['options'], $q['correct_index'])) {
            throw new RuntimeException('Question missing required fields: '.json_encode($q));
        }
        if (! is_array($q['options']) || count($q['options']) !== 4) {
            throw new RuntimeException('Question must have exactly 4 options: '.json_encode($q));
        }
        return [
            'question' => (string) $q['question'],
            'options' => array_map('strval', $q['options']),
            'correct_index' => (int) $q['correct_index'],
            'explanation' => (string) ($q['explanation'] ?? ''),
        ];
    }
}
