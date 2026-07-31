<?php

namespace App\Services\Llm;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiDriver implements LlmDriver
{
    public function generateJson(string $system, string $user, array $schema): array
    {
        $apiKey = config('assessments.gemini.api_key');
        if (empty($apiKey)) {
            throw new RuntimeException('GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and add it to your .env.');
        }

        $model = config('assessments.gemini.model');
        $endpoint = config('assessments.gemini.endpoint_base')."{$model}:generateContent?key={$apiKey}";

        $response = Http::withHeaders(['content-type' => 'application/json'])
            ->timeout(config('assessments.gemini.timeout_seconds'))
            ->post($endpoint, [
                'system_instruction' => ['parts' => [['text' => $system]]],
                'contents' => [['role' => 'user', 'parts' => [['text' => $user]]]],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'responseSchema' => $this->translateSchema($schema),
                    'temperature' => 0.7,
                ],
            ]);

        if ($response->failed()) {
            $body = $response->json();
            throw new RuntimeException('Gemini API error: '.($body['error']['message'] ?? $response->body()));
        }

        $text = $response->json('candidates.0.content.parts.0.text');
        if (! $text) {
            throw new RuntimeException('Gemini response missing text content: '.$response->body());
        }

        return json_decode($text, true, flags: JSON_THROW_ON_ERROR);
    }

    /**
     * Gemini accepts a subset of JSON Schema. Strip fields it doesn't support
     * (minItems/maxItems on arrays are OK; enum works; but we drop `additionalProperties`,
     * `$schema` markers, etc.) and normalise types to lowercase.
     */
    private function translateSchema(array $schema): array
    {
        $out = [];
        foreach ($schema as $key => $value) {
            if (in_array($key, ['additionalProperties', '$schema', 'title', 'description'], true)) {
                continue;
            }
            if ($key === 'type' && is_string($value)) {
                $out['type'] = strtoupper($value);
                continue;
            }
            if (is_array($value)) {
                $out[$key] = $this->isAssoc($value)
                    ? $this->translateSchema($value)
                    : array_map(fn ($v) => is_array($v) ? $this->translateSchema($v) : $v, $value);
                continue;
            }
            $out[$key] = $value;
        }
        return $out;
    }

    private function isAssoc(array $arr): bool
    {
        if ($arr === []) {
            return false;
        }
        return array_keys($arr) !== range(0, count($arr) - 1);
    }
}
