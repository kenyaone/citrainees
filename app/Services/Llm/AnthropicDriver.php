<?php

namespace App\Services\Llm;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AnthropicDriver implements LlmDriver
{
    public function generateJson(string $system, string $user, array $schema): array
    {
        $apiKey = config('assessments.anthropic.api_key');
        if (empty($apiKey)) {
            throw new RuntimeException('ANTHROPIC_API_KEY is not set. Either set it, or switch ASSESSMENT_AI_PROVIDER to gemini.');
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => config('assessments.anthropic.api_version'),
            'content-type' => 'application/json',
        ])
            ->timeout(config('assessments.anthropic.timeout_seconds'))
            ->post(config('assessments.anthropic.endpoint'), [
                'model' => config('assessments.anthropic.model'),
                'max_tokens' => config('assessments.anthropic.max_tokens'),
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

        $text = '';
        foreach ($response->json('content') ?? [] as $block) {
            if (($block['type'] ?? '') === 'text') {
                $text .= $block['text'];
            }
        }

        return json_decode($text, true, flags: JSON_THROW_ON_ERROR);
    }
}
