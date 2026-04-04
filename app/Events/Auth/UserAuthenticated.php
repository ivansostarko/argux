<?php

namespace App\Events\Auth;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserAuthenticated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $userId,
        public string $email,
        public string $ip,
        public string $token,
    ) {}
}
