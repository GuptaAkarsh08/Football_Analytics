# Football Analytics — Ingestion Layer Checkpoint

**Date:** Oct 5, 2026
**Milestone:** First real data flowing end-to-end through the pipeline

---

## What just got done

The complete ingestion layer works end-to-end:

```
football-data.org API  →  Python fetch script  →  KafkaProducer  →  raw.matches topic
```

**Verified:** 69 real La Liga (PD) finished matches successfully pushed to the `raw.matches` Kafka topic, confirmed via Kafka UI (localhost:8090) showing message count = 69.

---

## The code that makes it work

Two classes, cleanly separated by responsibility (separation of concerns):

### `FootballAPI` — only talks to the API
- Loads API key + base URL from `.env` (never hardcoded, `.env` is gitignored)
- Generic `fetch(competition, resource, params)` method — one method handles all four endpoints
- Thin named wrappers for readability: `get_matches`, `get_standings`, `get_scorers`, `get_teams`
- Uses `raise_for_status()` + try/except for graceful error handling
- `timeout=10` on every request so it never hangs forever

### `KafkaDataPush` — only sends to Kafka
- Creates a `KafkaProducer` pointing at `localhost:9092` (from `.env` with fallback default)
- `value_serializer` converts each match dict → JSON → bytes automatically
- `key_serializer` keys each message by `match_id` (keeps a match's data ordered in one partition)
- `send(topic, key, message)` pushes one message
- `flush()` forces all buffered messages to actually send before the script ends

### Main block — ties them together
- Creates each class once (not repeatedly in the loop)
- Fetches matches, loops over them, pushes each **raw** match to `raw.matches`
- Key design decision: pushes RAW match objects, not simplified — simplification happens later in Silver (Bronze stores raw as insurance)

---

## Available endpoints (what football-data.org free tier actually gives)

| Resource | Endpoint | Useful filters |
|----------|----------|----------------|
| Matches | `/v4/competitions/{code}/matches` | status, dateFrom, dateTo, season, matchday |
| Standings | `/v4/competitions/{code}/standings` | season, matchday |
| Top scorers | `/v4/competitions/{code}/scorers` | limit, season |
| Teams | `/v4/competitions/{code}/teams` | season |

Competition codes: `PD` (La Liga), `PL` (Premier League), `SA` (Serie A), `BL1` (Bundesliga), `FL1` (Ligue 1)

**Not available on free tier:** live/in-play data, detailed per-player stats, ranked lists of assists/cards/fouls/offsides/saves. Those get COMPUTED later from StatsBomb event data in the Spark/dbt layers — that computation IS the engineering value.

**Rate limit:** 10 requests/minute. Fine for a few calls; add `time.sleep()` if looping over many competitions.

---

## Problems hit and solved (interview-ready stories)

1. **URL came back `None`** → `.env` variables weren't loaded / name mismatch → fixed with `load_dotenv()` and matching exact variable names
2. **API key in wrong place** → football-data.org needs key in `X-Auth-Token` header, not URL params
3. **Empty matches response** → `/v4/matches` defaults to today only; switched to competition endpoint for full season
4. **"Broker may not be available"** → Kafka container was just `Started`, not yet `Running` — the JVM needs ~15-20s to boot and listen on 9092. "Container running ≠ service ready." Fixed by waiting before connecting. (Same lesson as the Break+Note session — applied independently this time.)

---

## Where this sits in the overall plan

**Phase 1 — Ingestion** (current)
- [x] Day 4: Football API → Kafka (matches) — DONE, 69 matches verified
- [ ] Standings / scorers / teams into their own topics (optional expansion)
- [ ] StatsBomb event data loader → `raw.match_events`
- [ ] Schema Registry + Avro
- [ ] Debezium CDC → `raw.transfers`

**Phase 2 — Processing with Spark** (next big step)
- Spark reads from `raw.matches` → writes Bronze Delta table (raw, as-is)
- Then Silver (cleaned, typed, deduplicated) — this is where `simplify_match` logic lives
- Then Spark Structured Streaming for live/simulated events

**Phases 3-5:** dbt (Gold star schema) → Airflow + Great Expectations → FastAPI + Metabase + RAG

---

## Next decision point

Two valid options for the next session:
- **Expand ingestion** — push standings, scorers, teams into their own topics (more data variety, stays in familiar territory)
- **Move to Spark / Bronze** — start turning Kafka data into a queryable Delta table (new skill, bigger momentum)

Either is fine. Spark/Bronze is the more exciting leap and where real new learning happens.

---

## Checklist before moving on
- [ ] Look at one message in Kafka UI Messages tab — confirm it's the full raw match object
- [ ] Note this milestone in Notion, tied to interview Q: "Walk me through how data enters your pipeline"
- [ ] Commit the ingestion code to GitHub
