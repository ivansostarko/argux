# Mock Job Queue

## Overview

ARGUX simulates background job processing without a real queue backend. No Redis, database, or SQS is required.

## Mock Job Pattern

When a feature would realistically process something asynchronously, we simulate it:

```typescript
// Simulate async operation
const [loading, setLoading] = useState(false);

const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        toast.success('Export complete', 'report.pdf generated.');
    }, 1500);
};
```

## Simulated Operations

| Operation | Simulated Duration | Location |
|-----------|-------------------|----------|
| PDF export | 1.5s | Person/Org Show pages |
| AI summary generation | 2.0s | Person/Org Show pages |
| Photo upload | Instant (FileReader) | Vehicle Create/Edit |
| Form submission | 1.2s | All Create/Edit pages |

## Production Queue (Planned)

Production targets Apache Kafka for event streaming with:
- 1,000,000+ events/day ingestion
- Sub-second alert latency
- Laravel Octane with Swoole workers
- Job types: data sync, AI inference, report generation, media processing
