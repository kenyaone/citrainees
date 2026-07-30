<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAlumni
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'alumni' || ! $user->alumniProfile) {
            abort(403, 'Alumni access required.');
        }

        return $next($request);
    }
}
