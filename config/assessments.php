<?php

return [
    'ai' => [
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
