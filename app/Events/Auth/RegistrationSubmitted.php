<?php

namespace App\Events\Auth;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RegistrationSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $email,
        public string $name,
        public string $ip,
        public string $registrationId,
    ) {}
}
