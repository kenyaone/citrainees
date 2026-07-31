<?php

namespace App\Services\Llm;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GroqDriver implements LlmDriver
{
    public function generateJson(string $system, string $user, array $schema): array
    {
        $apiKey = config('assessments.groq.api_key');
        if (empty($apiKey)) {
            throw new RuntimeException('GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys.');
        }

        // Groq is OpenAI-compatible. Its json_object mode guarantees valid JSON but
        // doesn't enforce the schema, so we inline the schema in the system prompt
        // so the model knows the expected structure.
        $systemWithSchema = $system
            ."\n\nReturn a JSON object matching this schema exactly (no prose, no markdown fences):\n"
            .json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        $response = Http::withHeaders([
            'authorization' => 'Bearer '.$apiKey,
            'content-type' => 'application/json',
        ])
            ->timeout(config('assessments.groq.timeout_seconds'))
            ->post(config('assessments.groq.endpoint'), [
                'model' => config('assessments.groq.model'),
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.7,
                'messages' => [
                    ['role' => 'system', 'content' => $systemWithSchema],
                    ['role' => 'user', 'content' => $user],
                ],
            ]);

        if ($response->failed()) {
            $body = $response->json();
            throw new RuntimeException('Groq API error: '.($body['error']['message'] ?? $response->body()));
        }

        $text = $response->json('choices.0.message.content');
        if (! $text) {
            throw new RuntimeException('Groq response missing message content: '.$response->body());
        }

        return json_decode($text, true, flags: JSON_THROW_ON_ERROR);
    }
}
