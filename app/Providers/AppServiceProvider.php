<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    protected function configureRateLimiting(): void
    {
        // Signup + employer-confirmation: brute-force protection per IP + per token
        RateLimiter::for('public-token', function (Request $request) {
            $token = $request->route('token') ?? 'no-token';
            return [
                Limit::perMinute(10)->by($request->ip()),
                Limit::perMinute(5)->by($token),
            ];
        });

        // File uploads: caps abuse of the disk
        RateLimiter::for('uploads', fn (Request $request) => Limit::perHour(20)->by(
            $request->user()?->id ?: $request->ip(),
        ));

        // CSV imports: heaviest endpoint, tight cap
        RateLimiter::for('csv-import', fn (Request $request) => Limit::perHour(5)->by(
            $request->user()?->id ?: $request->ip(),
        ));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
