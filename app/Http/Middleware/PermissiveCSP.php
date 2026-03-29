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

        // Remove ALL CSP headers that may have been set by other middleware, nginx, or Vite
        $response->headers->remove('Content-Security-Policy');
        $response->headers->remove('Content-Security-Policy-Report-Only');
        $response->headers->remove('X-Content-Security-Policy');
        $response->headers->remove('X-WebKit-CSP');

        // Set a single, fully permissive CSP — no 'none' anywhere
        $response->headers->set('Content-Security-Policy',
            "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss:; " .
            "script-src * 'unsafe-inline' 'unsafe-eval' blob:; " .
            "style-src * 'unsafe-inline'; " .
            "img-src * data: blob:; " .
            "connect-src *; " .
            "font-src * data:; " .
            "media-src * blob: data:; " .
            "worker-src * blob:; " .
            "frame-src * blob: data:; " .
            "child-src * blob:"
        );

        return $response;
    }
}
