<?php

return [
    // Active LLM provider for practical assessment task generation + grading, and
    // for the AI quiz generator command. Options: 'groq', 'gemini', 'anthropic'.
    'provider' => env('ASSESSMENT_AI_PROVIDER', 'groq'),

    // Groq (free tier at https://console.groq.com/keys — no card required, 14K req/day).
    'groq' => [
        'api_key' => env('GROQ_API_KEY'),
        'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
        'timeout_seconds' => 90,
    ],

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

    // Skills that require formal accreditation (professional body, TSC, KMTC, etc.).
    // /assessments UI hides all self-assessment paths for these — only certificate upload.
    // PracticalAssessmentController + AiQuizGenerator both refuse to generate for them.
    'regulated_skill_slugs' => [
        'nursing',
        'clinical-medicine',
        'pharmacy',
        'medical-laboratory',
        'medicine',
        'dentistry',
        'community-health',
        'nutrition',
        'teaching',
        'early-childhood-education',
        'law',
        'advocate',
        'engineering',
        'architecture',
        'quantity-surveying',
    ],

    'default_pass_threshold' => 70,
    'default_time_limit_minutes' => 15,
    'default_question_count' => 10,
];
