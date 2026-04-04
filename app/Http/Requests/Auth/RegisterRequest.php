<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
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
            'phone'                 => ['nullable', 'string', 'min:6', 'max:20', 'regex:/^[+]?[0-9\s\-().]+$/'],
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

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'first_name.min' => 'First name must be at least :min characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.min' => 'Last name must be at least :min characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'phone.min' => 'Phone number must be at least :min characters.',
            'phone.max' => 'Phone number cannot exceed :max characters.',
            'phone.regex' => 'Please enter a valid phone number.',
            'password.required' => 'Password is required.',
            'password_confirmation.required' => 'Password confirmation is required.',
            'password_confirmation.same' => 'Passwords do not match.',
            'agree_terms.accepted' => 'You must acknowledge the terms to proceed.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        if ($this->expectsJson() || $this->is('mock-api/*')) {
            throw new HttpResponseException(response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()->toArray(),
            ], 422));
        }

        parent::failedValidation($validator);
    }
}
