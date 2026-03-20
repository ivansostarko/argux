<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'                 => ['required', 'email'],
            'code'                  => ['required', 'string', 'size:6'],
            'password'              => ['required', 'string', Password::min(12)->mixedCase()->numbers()->symbols()],
            'password_confirmation' => ['required', 'same:password'],
        ];
    }

    public function attributes(): array
    {
        return [
            'email'    => __('auth.fields.email'),
            'password' => __('auth.fields.password'),
        ];
    }
}
