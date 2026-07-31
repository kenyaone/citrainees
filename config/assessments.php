<?php

return [
    // Active LLM provider for practical assessment task generation + grading, and
    // for the AI quiz generator command. Options: 'gemini', 'anthropic'.
    'provider' => env('ASSESSMENT_AI_PROVIDER', 'gemini'),

    // Google Gemini (free tier at https://aistudio.google.com/apikey — no card required).
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
        'endpoint_base' => 'https://generativelanguage.googleapis.com/v1beta/models/',
        'timeout_seconds' => 90,
    ],

    // Anthropic Claude (paid). Set ASSESSMENT_AI_PROVIDER=anthropic to use this.
    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-haiku-4-5'),
        'endpoint' => env('ANTHROPIC_ENDPOINT', 'https://api.anthropic.com/v1/messages'),
        'api_version' => '2023-06-01',
        'max_tokens' => 4000,
        'timeout_seconds' => 90,
    ],

    'regulated_skill_slugs' => [
        'nursing',
        'clinical-medicine',
        'pharmacy',
        'medical-laboratory',
    ],

    'default_pass_threshold' => 70,
    'default_time_limit_minutes' => 15,
    'default_question_count' => 10,
];
