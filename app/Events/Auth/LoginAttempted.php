<?php

namespace App\Events\Auth;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LoginAttempted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $email,
        public string $ip,
        public string $userAgent,
        public bool $success,
        public ?string $failureReason = null,
    ) {}
}
