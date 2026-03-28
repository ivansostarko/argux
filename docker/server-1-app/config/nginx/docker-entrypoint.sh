#!/bin/sh
# Start nginx-prometheus-exporter in background
nginx-prometheus-exporter -nginx.scrape-uri=http://localhost:8181/stub_status &
