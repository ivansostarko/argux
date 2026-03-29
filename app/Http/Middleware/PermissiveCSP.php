<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets a fully permissive Content-Security-Policy for the mockup application.
 * This allows all external tile providers, CDNs, APIs, and WebSocket connections.
 *
 * WARNING: This is for mockup/development only. Production deployments should
 * use a restrictive CSP tailored to the actual domains in use.
 */
class PermissiveCSP
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $csp = implode('; ', [
            "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss:",
            "script-src * 'self' 'unsafe-inline' 'unsafe-eval' blob:",
            "style-src * 'self' 'unsafe-inline'",
            "img-src * 'self' data: blob: https: http:",
            "connect-src * 'self' https: http: ws: wss: data: blob:",
            "font-src * 'self' data: https: http:",
            "media-src * 'self' blob: https: http: data:",
            "worker-src * 'self' blob:",
            "frame-src * 'self' https: http: blob: data:",
            "child-src * 'self' blob:",
        ]);

        $response->headers->set('Content-Security-Policy', $csp);

        // Remove any restrictive headers that frameworks might add
        $response->headers->remove('X-Content-Security-Policy');

        return $response;
    }
}
