<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\TwoFactorRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function login()
    {
        return Inertia::render('Auth/Login');
    }

    public function authenticate(LoginRequest $request)
    {
        Log::info('Mock login attempt', ['email' => $request->email]);

        // Simulate authentication delay
        usleep(800_000);

        // Mock: always succeed and redirect to 2FA
        session(['pending_2fa' => true, 'auth_email' => $request->email]);

        return redirect()->route('2fa')->with('success', __('auth.credentials_verified'));
    }

    public function register()
    {
        return Inertia::render('Auth/Register');
    }

    public function store(RegisterRequest $request)
    {
        Log::info('Mock registration submitted', [
            'email' => $request->email,
            'name'  => $request->first_name . ' ' . $request->last_name,
        ]);

        usleep(1_200_000);

        return redirect()->route('login')->with('success', __('auth.registration_submitted'));
    }

    public function twoFactor()
    {
        $maskedEmail = 'o••••r@argux.mil';
        $maskedPhone = '••••47';

        return Inertia::render('Auth/TwoFactor', [
            'maskedEmail' => $maskedEmail,
            'maskedPhone' => $maskedPhone,
        ]);
    }

    public function verifyTwoFactor(TwoFactorRequest $request)
    {
        Log::info('Mock 2FA verification', ['method' => $request->method]);

        usleep(600_000);

        // Mock: code "000000" always fails, anything else succeeds
        if ($request->code === '000000') {
            return back()->withErrors(['code' => __('auth.invalid_2fa_code')]);
        }

        session()->forget('pending_2fa');

        return redirect('/map')->with('success', __('auth.authenticated'));
    }

    public function resendTwoFactor(Request $request)
    {
        Log::info('Mock 2FA code resent', ['method' => $request->input('method')]);

        return back()->with('success', __('auth.code_resent'));
    }

    public function forgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendResetCode(ForgotPasswordRequest $request)
    {
        Log::info('Mock password reset code sent', ['email' => $request->email]);

        usleep(800_000);

        return back()->with('success', __('auth.reset_code_sent'));
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);

        usleep(500_000);

        return back()->with('success', __('auth.code_verified'));
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        Log::info('Mock password reset completed', ['email' => $request->email]);

        usleep(800_000);

        return redirect()->route('login')->with('success', __('auth.password_reset_complete'));
    }
}
