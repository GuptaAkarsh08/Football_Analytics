# Football Analytics Platform — Restart Plan (Sep 29 → Diwali)

## Where you actually are right now

You are NOT starting from scratch. This is important — restarting would be busywork. Here's what's already done and working:

**Completed and saved:**
- GitHub repo + folder structure
- Docker Compose running Kafka + Zookeeper + PostgreSQL (both Mac and Ubuntu)
- `raw.matches` topic created, producer/consumer tested manually
- Kafka fundamentals understood (partitions, brokers, replication, offsets, retention)
- Producer internals covered (acks, batching, idempotence)
- Notion notes: Docker, Kafka, Events/Streaming/Event-Driven Architecture

**What's cold (knowledge you have, just out of practice):**
- The Kafka concepts above — these will warm up fast once you're producing real data again

**Loose threads still open:**
- Consumer groups, delivery semantics, Kafka Connect (Kafka depth, optional to finish)
- `mobility` tutorial project (Kafka UI port issue) — side project, not essential
- Window Functions in SQL — flagged gap, slot in later
- Day 4 (REST API ingestion) — THE next real build step, not yet started

---

## How we work differently this time

The goal was always genuine depth, not just finishing. So the working method shifts:

- I give you the **goal** for each step, you **attempt it first**
- You get stuck or unsure → we fix it together
- You're never blocked, but you build the muscle instead of just copying commands
- Each new tech still follows **Learn → Build → Break → Note**

---

## The warm-up (do this first, today)

Before any new building, confirm what's still alive. One command:

```bash
docker ps
```

- See `kafka`, `zookeeper`, `postgres`? → alive, proceed
- Empty or missing? → `cd` into the Docker folder and `docker compose up -d`

That's the entire warm-up. No rebuilding.

---

## The plan — Phase by phase

Each phase is a goal + the steps to get there. Attempt each step yourself first; lean on help only when stuck.

### PHASE 1 — Finish Ingestion (the immediate focus)

**Goal:** Real football data flows automatically from APIs into Kafka topics — no more hand-typed messages.

**Day 4 — Football API → Kafka producer**
- [ ] Get a football-data.org API key (register if needed — free, instant)
- [ ] Write `ingestion/football_api.py` — fetch La Liga + Premier League matches
- [ ] Write a Kafka producer that pushes those matches into `raw.matches`
- [ ] Run it, confirm real match data lands in the topic (consume to verify)
- [ ] Note: how API auth, rate limits, and pagination work

**Day 5 — StatsBomb event data**
- [ ] Install `statsbombpy`
- [ ] Write `ingestion/statsbomb_loader.py` — load events for a few matches
- [ ] Push events into a new topic `raw.match_events`
- [ ] Note: what event-level data looks like (passes, shots, x/y coords)

**Day 6 — Schema Registry + Avro**
- [ ] Add Schema Registry to docker-compose
- [ ] Define an Avro schema for matches, update producer to use it
- [ ] Break it: add a field without a default → watch it fail → add with default → succeeds (schema evolution)
- [ ] Note: Avro, Schema Registry, compatibility modes

**Day 7 — CDC with Debezium**
- [ ] Add Debezium to docker-compose
- [ ] Create PostgreSQL `players` table, seed it
- [ ] Configure Debezium connector, update a row, watch the CDC event appear in Kafka
- [ ] Break it: delete a row → confirm Debezium emits a delete event
- [ ] Note: CDC, log-based capture, Debezium

**Phase 1 done when:** 3-4 topics populated with real data, schema enforced, CDC working.

---

### PHASE 2 — Processing with Spark

**Goal:** Spark reads from Kafka, cleans the data, writes it to Delta Lake in Bronze → Silver layers.

- [ ] Learn: PySpark basics (DataFrames, transformations vs actions, lazy evaluation) — toy example on a small CSV first
- [ ] Learn: Delta Lake basics (transaction log, time travel, MERGE) — toy example writing one Delta table
- [ ] Add Spark + MinIO (S3-style storage) to docker-compose
- [ ] Build Bronze: Spark reads Kafka → writes raw Delta tables (`bronze/matches`, `bronze/events`)
- [ ] Build Silver: clean, type-cast, deduplicate, handle SCD Type 2 on players
- [ ] Learn + Build streaming: Spark Structured Streaming on live events, windowed aggregation, watermark
- [ ] Break it: kill the streaming job mid-run, restart, check it resumes (checkpointing)
- [ ] Note: Spark internals, Delta Lake, medallion, watermarks, broadcast joins

**Phase 2 done when:** Bronze + Silver Delta tables populated, streaming job running.

---

### PHASE 3 — Transformation with dbt

**Goal:** dbt turns Silver into a Gold-layer star schema, with tests.

- [ ] Learn: dbt fundamentals (models, refs, sources, tests, materializations)
- [ ] Learn: dimensional modeling (star schema, fact vs dimension, grain, SCD)
- [ ] Build: staging models, then fact tables (`fct_matches`, `fct_player_match_stats`)
- [ ] Build: dimension tables (`dim_players` with SCD Type 2 via snapshot, `dim_teams`, `dim_dates`)
- [ ] Add dbt tests (unique, not_null, relationships, accepted_values)
- [ ] Add PII masking on any user data at Silver
- [ ] Break it: insert a duplicate key, run dbt test, watch it catch the error
- [ ] (Stretch) GitHub Action running `dbt parse` on every push
- [ ] Note: star schema, SCD, dbt, CI/CD

**Phase 3 done when:** Gold star schema built, all tests passing, lineage graph generated.

---

### PHASE 4 — Orchestration + Quality

**Goal:** Airflow runs everything on schedule; Great Expectations catches bad data.

- [ ] Learn: Airflow fundamentals (DAGs, tasks, operators, sensors, retries)
- [ ] Build DAGs: ingest → Spark → dbt → quality, each gated on the previous
- [ ] Learn + Build: Great Expectations suites for Bronze/Silver/Gold
- [ ] Break it: force a task failure (check retries), run a backfill (check idempotency), feed bad data (check GE catches it)
- [ ] Note: DAGs, sensors, retries, backfills, data quality

**Phase 4 done when:** Full pipeline runs on schedule, quality checks active.

---

### PHASE 5 — Serving + AI

**Goal:** The data becomes useful — dashboards, API, and an AI insights layer.

- [ ] Build: FastAPI endpoints serving Gold-layer data
- [ ] Build: Metabase dashboards (league overview, player comparison)
- [ ] Learn + Build: ChromaDB vector store, embed match reports
- [ ] Build: RAG pipeline (Gold stats + vector search + LLM synthesis), `/api/insights` endpoint
- [ ] (Stretch) Text-to-SQL endpoint with safety checks
- [ ] Break it: ask RAG a question with no relevant data, confirm it doesn't hallucinate
- [ ] Full end-to-end test: `docker compose down && up` from scratch, everything works
- [ ] Note: RAG architecture, vector search

**Phase 5 done when:** Dashboards live, API serving, RAG answering questions.

---

### FINISH — Polish + Showcase

- [ ] Write README with architecture diagram + dashboard screenshots
- [ ] Clean up code, add docstrings
- [ ] Final commit, pin repo on GitHub
- [ ] (Optional) short blog post / LinkedIn post on what you built
- [ ] Go through the interview-question checklist — answer each using your own project

---

## Side threads (slot in when it fits, not blocking)

- **Window Functions in SQL** — half-day Learn+Build, genuinely common in interviews
- **Consumer groups / delivery semantics / Kafka Connect** — finish Kafka depth if you want completeness
- **mobility tutorial Kafka UI fix** — only if you want to keep following that tutorial

---

## What's after this project (the bigger sequence)

1. **This project** → finish by Diwali
2. **AWS Data Engineer Associate cert** → sequential focus after
3. **Freelancing outreach to US clients** → using your sister's roadmap

One thing at a time. This project is the current one. Everything else waits.

---

## The one rule for this restart

Don't rebuild what works. Don't start from scratch. Warm up the cold knowledge by *using* it. The next real action is always the smallest next step — right now that's `docker ps`, then the football-data.org API key.
