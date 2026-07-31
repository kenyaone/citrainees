<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'is_staff' => $request->user()->isStaff(),
                    'ci_project_id' => $request->user()->ci_project_id,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'import_skipped' => fn () => $request->session()->get('import_skipped'),
                'employer_lead_success' => fn () => $request->session()->get('employer_lead_success'),
                'invite_request_success' => fn () => $request->session()->get('invite_request_success'),
                'directory_message_success' => fn () => $request->session()->get('directory_message_success'),
            ],
            'pending_verifications_count' => fn () => $request->user()?->isStaff()
                ? \App\Models\Verification::where('status', 'pending')->count()
                    + \App\Models\SkillVerificationRequest::where('status', 'pending')->count()
                    + \App\Models\SkillAssessmentAttempt::query()
                        ->whereHas('assessment', fn ($q) => $q->where('type', 'practical'))
                        ->whereNotNull('submitted_at')
                        ->whereNull('voided_at')
                        ->where('passed', true)
                        ->whereNull('staff_decision')
                        ->count()
                : 0,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
