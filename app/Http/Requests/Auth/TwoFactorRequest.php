<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class TwoFactorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code'   => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
            'method' => ['required', 'string', 'in:app,sms,email'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.regex' => __('auth.validation.code_digits_only'),
            'code.size'  => __('auth.validation.code_six_digits'),
        ];
    }
}
