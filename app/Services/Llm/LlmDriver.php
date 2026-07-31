<?php

namespace App\Services\Llm;

interface LlmDriver
{
    /**
     * Send a system + user prompt and get back a decoded JSON object matching $schema.
     * Providers translate $schema (a JSON Schema fragment) into their native structured-output format.
     * Throws RuntimeException on API failure, missing key, or malformed response.
     */
    public function generateJson(string $system, string $user, array $schema): array;
}
