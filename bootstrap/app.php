<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
  ->withRouting(
    web: [
        __DIR__.'/../routes/web.php',
        __DIR__.'/../routes/auth-api.php',
        __DIR__.'/../routes/admin-api.php',
    ],
)
    
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\SetLocale::class,
                 \App\Http\Middleware\PermissiveCSP::class,
            
            
        ]);

           $middleware->append([
        \Illuminate\Http\Middleware\HandleCors::class,
         \Illuminate\Http\Middleware\TrustProxies::class,
     
    ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {

        // Map HTTP status codes to Inertia error pages
        $errorPages = [
            403 => 'Errors/403',
            404 => 'Errors/404',
            408 => 'Errors/408',
            419 => 'Errors/419',
            429 => 'Errors/429',
          #  500 => 'Errors/500',
            503 => 'Errors/503',
        ];

        $exceptions->respond(function ($response, $exception, $request) use ($errorPages) {
            $status = $response->getStatusCode();

            // Only render custom pages for Inertia/web requests
            if (! $request->expectsJson() && isset($errorPages[$status])) {
                return Inertia::render($errorPages[$status], [
                    'status' => $status,
                ])
                ->toResponse($request)
                ->setStatusCode($status);
            }

            // For 500s in non-Inertia context, also render if it's a web request
            if (! $request->expectsJson() && $status >= 500 && isset($errorPages[500])) {
                return Inertia::render($errorPages[500], [
                    'status' => $status,
                ])
                ->toResponse($request)
                ->setStatusCode($status);
            }

            return $response;
        });

    })->create();
