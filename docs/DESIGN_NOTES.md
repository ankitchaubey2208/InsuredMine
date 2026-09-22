# Implementation Notes

## Architecture

The project uses thin routes, HTTP-focused controllers, framework-independent validators, application services, persistence repositories, and isolated Mongoose models. This is enough separation to test and evolve each concern without introducing a large enterprise framework.

MongoDB fits the source data because records arrive as spreadsheet rows, fields can be incomplete, and aggregation pipelines can join and group the required collections. Separate collections prevent repeated agent, carrier, account, and LOB data in every policy. ObjectId references preserve relationships while unique business keys make repeat imports idempotent.

## Worker threads

A worker thread is a JavaScript execution environment with its own event loop on another thread in the same process. The API transfers only the file path and MongoDB URI. The worker parses the spreadsheet, normalizes rows, and executes bulk persistence, then posts a compact summary to the parent.

Parsing large XLSX files can consume meaningful CPU. Running it on the main thread would delay every HTTP request. Worker `message`, `error`, and `exit` events cover success, thrown errors, and premature exits. A child process would provide stronger memory/crash isolation but has higher startup and IPC cost; a worker is appropriate for bounded CPU work in this assessment.

## MongoDB

Policy search first narrows users, then queries policies using the indexed `user` reference. Population keeps the simple search readable. The grouped endpoint uses `$lookup` because grouping and joining belong on the database server and should not load all policies into Node.js memory.

Important indexes include unique business keys, policy foreign keys, `{ user: 1, policyStartDate: -1 }`, and `{ status: 1, scheduledFor: 1 }`. Diagnose a slow pipeline with `explain('executionStats')`, move selective `$match` stages early, project unused fields away, confirm lookup indexes, and keep page sizes bounded. At millions of policies, use cursor pagination, archive old data, consider sharding on a stable high-cardinality key, and precompute expensive reporting views where justified.

## Node.js lifecycle

The event loop advances timers and I/O callbacks on one JavaScript thread; blocking CPU work prevents it from serving unrelated requests. That is why parsing runs in a worker.

CPU usage is calculated from differences between two cumulative OS snapshots. At 70% (configurable), monitoring fires once and starts graceful shutdown. The scheduler stops, the HTTP listener drains existing connections, MongoDB disconnects, and the process exits non-zero. PM2—not the application—starts the replacement process and applies restart backoff.

## Scheduling

The POST endpoint validates and persists work, then responds immediately. The scheduler atomically changes one due record from `SCHEDULED` to `PROCESSING`, so competing instances cannot claim the same record. A unique index on the resulting message's schedule reference makes the write idempotent. Work survives restarts because MongoDB, not an in-memory timer, is the source of truth. Failures are retried up to three attempts and then marked `FAILED` with the error.

BullMQ/Redis would be the production choice for high throughput, delayed jobs, backoff policies, observability, and dedicated consumers. The MongoDB claim loop keeps this service self-contained while preserving the same durability and ownership principles.

## Production evolution

- Package the API and workers separately, deploy behind a load balancer, and use managed MongoDB.
- Export structured logs, metrics, traces, queue lag, worker failures, and import throughput.
- Store uploads in object storage and publish jobs to a durable queue.
- Stream CSV records in bounded batches; use separate worker processes when memory isolation matters.
- Use readiness/liveness probes and let the platform enforce CPU and restart policies.
- Protect import and search endpoints with authentication, authorization, throttling, and audit trails.
