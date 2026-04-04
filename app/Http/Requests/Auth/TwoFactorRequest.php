<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class TwoFactorRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'challenge_token' => ['sometimes', 'string'],
            'method' => ['sometimes', 'string', 'in:authenticator,email,sms'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Verification code is required.',
            'code.size' => 'Code must be exactly 6 digits.',
            'code.regex' => 'Code must contain only numbers.',
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
