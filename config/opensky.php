<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OpenSky Network API Configuration
    |--------------------------------------------------------------------------
    |
    | Place your credentials.json from opensky-network.org in the project root
    | or set OPENSKY_USERNAME and OPENSKY_PASSWORD in your .env file.
    |
    | credentials.json format: {"username": "your_user", "password": "your_pass"}
    |
    */

    'username' => env('OPENSKY_USERNAME', ''),
    'password' => env('OPENSKY_PASSWORD', ''),
    'credentials_path' => base_path('credentials.json'),
    'api_url' => 'https://opensky-network.org/api/states/all',

    // Default bounding box (Croatia + surrounding region)
    'bounds' => [
        'lamin' => env('OPENSKY_LAT_MIN', 42.0),
        'lamax' => env('OPENSKY_LAT_MAX', 47.5),
        'lomin' => env('OPENSKY_LNG_MIN', 13.0),
        'lomax' => env('OPENSKY_LNG_MAX', 20.0),
    ],

    // Cache TTL in seconds (OpenSky updates ~every 10s)
    'cache_ttl' => 8,
];
