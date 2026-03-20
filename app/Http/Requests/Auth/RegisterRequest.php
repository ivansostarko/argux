<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'            => ['required', 'string', 'min:2', 'max:100'],
            'last_name'             => ['required', 'string', 'min:2', 'max:100'],
            'email'                 => ['required', 'email', 'max:255'],
            'phone'                 => ['nullable', 'string', 'max:20'],
            'password'              => ['required', 'string', Password::min(12)->mixedCase()->numbers()->symbols()],
            'password_confirmation' => ['required', 'same:password'],
            'agree_terms'           => ['accepted'],
        ];
    }

    public function attributes(): array
    {
        return [
            'first_name'            => __('auth.fields.first_name'),
            'last_name'             => __('auth.fields.last_name'),
            'email'                 => __('auth.fields.email'),
            'phone'                 => __('auth.fields.phone'),
            'password'              => __('auth.fields.password'),
            'password_confirmation' => __('auth.fields.password_confirmation'),
            'agree_terms'           => __('auth.fields.agree_terms'),
        ];
    }
}
