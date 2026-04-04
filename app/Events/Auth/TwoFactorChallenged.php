<?php

namespace App\Events\Auth;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TwoFactorChallenged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $userId,
        public string $method,
        public string $ip,
    ) {}
}
