<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect('/login');
        }

        if ($user->role === User::ROLE_ALUMNI) {
            return redirect('/my-profile');
        }

        return redirect('/dashboard');
    }
}
