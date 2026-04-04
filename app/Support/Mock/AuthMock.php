<?php

namespace App\Support\Mock;

use Illuminate\Support\Str;

class AuthMock
{
    /**
     * Mock operator accounts for the platform.
     */
    public static function users(): array
    {
        return [
            [
                'id' => 1,
                'email' => 'operator@argux.mil',
                'password' => 'Argux2026!Secure',
                'first_name' => 'Davor',
                'last_name' => 'Tomić',
                'rank' => 'Colonel',
                'role' => 'administrator',
                'department' => 'Counter-Intelligence Division',
                'clearance' => 'TOP SECRET // NOFORN',
                'avatar' => '/images/avatars/tomic.jpg',
                'phone' => '+385 91 555 0001',
                'status' => 'active',
                'mfa_enabled' => true,
                'mfa_method' => 'authenticator',
                'last_login' => '2026-03-24 08:15:00',
                'login_count' => 847,
                'failed_attempts' => 0,
                'locked_until' => null,
                'created_at' => '2024-06-01 00:00:00',
            ],
            [
                'id' => 2,
                'email' => 'analyst@argux.mil',
                'password' => 'Argux2026!Analyst',
                'first_name' => 'Nina',
                'last_name' => 'Horvat',
                'rank' => 'Captain',
                'role' => 'analyst',
                'department' => 'Surveillance Operations',
                'clearance' => 'SECRET',
                'avatar' => '/images/avatars/horvat-n.jpg',
                'phone' => '+385 91 555 0002',
                'status' => 'active',
                'mfa_enabled' => true,
                'mfa_method' => 'email',
                'last_login' => '2026-03-24 07:30:00',
                'login_count' => 412,
                'failed_attempts' => 0,
                'locked_until' => null,
                'created_at' => '2024-09-15 00:00:00',
            ],
            [
                'id' => 3,
                'email' => 'viewer@argux.mil',
                'password' => 'Argux2026!Viewer',
                'first_name' => 'Marko',
                'last_name' => 'Petrić',
                'rank' => 'Lieutenant',
                'role' => 'viewer',
                'department' => 'Field Operations',
                'clearance' => 'CONFIDENTIAL',
                'avatar' => '/images/avatars/petric.jpg',
                'phone' => '+385 91 555 0003',
                'status' => 'active',
                'mfa_enabled' => false,
                'mfa_method' => null,
                'last_login' => '2026-03-23 18:00:00',
                'login_count' => 156,
                'failed_attempts' => 0,
                'locked_until' => null,
                'created_at' => '2025-01-10 00:00:00',
            ],
            [
                'id' => 4,
                'email' => 'suspended@argux.mil',
                'password' => 'Argux2026!Suspended',
                'first_name' => 'Ivan',
                'last_name' => 'Kovačević',
                'rank' => 'Sergeant',
                'role' => 'analyst',
                'department' => 'IT Security',
                'clearance' => 'SECRET',
                'avatar' => null,
                'phone' => '+385 91 555 0004',
                'status' => 'suspended',
                'mfa_enabled' => true,
                'mfa_method' => 'sms',
                'last_login' => '2026-02-15 10:00:00',
                'login_count' => 89,
                'failed_attempts' => 5,
                'locked_until' => '2027-01-01 00:00:00',
                'created_at' => '2025-03-20 00:00:00',
            ],
            [
                'id' => 5,
                'email' => 'locked@argux.mil',
                'password' => 'Argux2026!Locked',
                'first_name' => 'Ana',
                'last_name' => 'Matić',
                'rank' => 'Sergeant',
                'role' => 'viewer',
                'department' => 'SIGINT',
                'clearance' => 'SECRET',
                'avatar' => null,
                'phone' => '+385 91 555 0005',
                'status' => 'active',
                'mfa_enabled' => true,
                'mfa_method' => 'authenticator',
                'last_login' => '2026-03-24 06:00:00',
                'login_count' => 234,
                'failed_attempts' => 4,
                'locked_until' => now()->addMinutes(15)->toDateTimeString(),
                'created_at' => '2025-06-01 00:00:00',
            ],
        ];
    }

    public static function findByEmail(string $email): ?array
    {
        return collect(self::users())->firstWhere('email', strtolower($email));
    }

    public static function findById(int $id): ?array
    {
        return collect(self::users())->firstWhere('id', $id);
    }

    /**
     * Safe user payload (no password).
     */
    public static function safeUser(array $user): array
    {
        return collect($user)->except(['password', 'locked_until'])->merge([
            'masked_email' => self::maskEmail($user['email']),
            'masked_phone' => self::maskPhone($user['phone'] ?? ''),
        ])->toArray();
    }

    public static function generateToken(): string
    {
        return 'argux_' . Str::random(64);
    }

    public static function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        return substr($parts[0], 0, 1) . str_repeat('•', max(3, strlen($parts[0]) - 2)) . substr($parts[0], -1) . '@' . $parts[1];
    }

    public static function maskPhone(string $phone): string
    {
        if (strlen($phone) < 4) return '••••';
        return '••••' . substr(preg_replace('/[^0-9]/', '', $phone), -2);
    }

    /**
     * Admin-only accounts for /admin/login.
     */
    public static function adminUsers(): array
    {
        return [
            [
                'id' => 101,
                'email' => 'admin@argux.mil',
                'password' => 'AdminArgux2026!',
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'rank' => 'Director',
                'role' => 'super_admin',
                'department' => 'System Administration',
                'clearance' => 'TOP SECRET // EYES ONLY',
                'avatar' => '/images/avatars/admin.jpg',
                'phone' => '+385 91 000 0001',
                'status' => 'active',
                'mfa_enabled' => true,
                'mfa_method' => 'authenticator',
                'last_login' => '2026-03-24 06:00:00',
                'login_count' => 1204,
                'failed_attempts' => 0,
                'locked_until' => null,
                'created_at' => '2024-01-01 00:00:00',
            ],
            [
                'id' => 102,
                'email' => 'security@argux.mil',
                'password' => 'SecArgux2026!',
                'first_name' => 'Petra',
                'last_name' => 'Novak',
                'rank' => 'Major',
                'role' => 'admin',
                'department' => 'Information Security',
                'clearance' => 'TOP SECRET',
                'avatar' => null,
                'phone' => '+385 91 000 0002',
                'status' => 'active',
                'mfa_enabled' => true,
                'mfa_method' => 'email',
                'last_login' => '2026-03-23 14:00:00',
                'login_count' => 567,
                'failed_attempts' => 0,
                'locked_until' => null,
                'created_at' => '2024-03-15 00:00:00',
            ],
            [
                'id' => 103,
                'email' => 'suspended-admin@argux.mil',
                'password' => 'SuspAdmin2026!',
                'first_name' => 'Branko',
                'last_name' => 'Vuković',
                'rank' => 'Captain',
                'role' => 'admin',
                'department' => 'Former IT Admin',
                'clearance' => 'SECRET',
                'avatar' => null,
                'phone' => '+385 91 000 0003',
                'status' => 'suspended',
                'mfa_enabled' => true,
                'mfa_method' => 'authenticator',
                'last_login' => '2026-01-10 09:00:00',
                'login_count' => 34,
                'failed_attempts' => 8,
                'locked_until' => '2027-01-01 00:00:00',
                'created_at' => '2025-06-01 00:00:00',
            ],
        ];
    }

    public static function findAdminByEmail(string $email): ?array
    {
        return collect(self::adminUsers())->firstWhere('email', strtolower($email));
    }

    /**
     * Mock active sessions for a user.
     */
    public static function sessions(int $userId): array
    {
        return [
            [
                'id' => 'sess_' . Str::random(16),
                'user_id' => $userId,
                'ip' => '10.0.1.42',
                'user_agent' => 'ARGUX Desktop / Windows 11 (Tauri 2.0)',
                'device' => 'Desktop — Windows',
                'location' => 'Zagreb, HR',
                'created_at' => '2026-03-24 08:15:00',
                'last_active' => now()->subMinutes(3)->toDateTimeString(),
                'is_current' => true,
            ],
            [
                'id' => 'sess_' . Str::random(16),
                'user_id' => $userId,
                'ip' => '10.0.2.88',
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
                'device' => 'Mobile — iOS',
                'location' => 'Zagreb, HR',
                'created_at' => '2026-03-23 14:30:00',
                'last_active' => now()->subHours(4)->toDateTimeString(),
                'is_current' => false,
            ],
        ];
    }

    /**
     * Mock audit log entries for auth actions.
     */
    public static function auditLog(int $userId): array
    {
        return [
            ['id' => 1, 'action' => 'login', 'ip' => '10.0.1.42', 'user_agent' => 'ARGUX Desktop', 'status' => 'success', 'timestamp' => '2026-03-24 08:15:00', 'details' => '2FA: authenticator'],
            ['id' => 2, 'action' => 'login', 'ip' => '10.0.1.42', 'user_agent' => 'ARGUX Desktop', 'status' => 'success', 'timestamp' => '2026-03-23 07:45:00', 'details' => '2FA: authenticator'],
            ['id' => 3, 'action' => 'password_change', 'ip' => '10.0.1.42', 'user_agent' => 'ARGUX Desktop', 'status' => 'success', 'timestamp' => '2026-03-20 14:00:00', 'details' => 'Password updated'],
            ['id' => 4, 'action' => 'login_failed', 'ip' => '192.168.5.12', 'user_agent' => 'Unknown', 'status' => 'failed', 'timestamp' => '2026-03-18 02:30:00', 'details' => 'Invalid password (attempt 1/5)'],
            ['id' => 5, 'action' => '2fa_resend', 'ip' => '10.0.1.42', 'user_agent' => 'ARGUX Desktop', 'status' => 'success', 'timestamp' => '2026-03-15 09:10:00', 'details' => 'Code resent via email'],
        ];
    }
}
