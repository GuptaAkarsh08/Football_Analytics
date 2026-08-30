import { useState } from "react";

const TABS = ["overview", "matches", "players", "transfers", "pipeline", "insights"];
const TAB_LABELS = {
  overview: "Overview",
  matches: "Match center",
  players: "Player lab",
  transfers: "Transfers",
  pipeline: "Pipeline health",
  insights: "AI insights",
};

const STANDINGS = [
  { pos: 1, team: "Real Madrid", p: 38, w: 29, d: 5, l: 4, gf: 87, ga: 28, pts: 92, form: ["W","W","D","W","W"] },
  { pos: 2, team: "Barcelona", p: 38, w: 27, d: 6, l: 5, gf: 82, ga: 35, pts: 87, form: ["W","L","W","W","D"] },
  { pos: 3, team: "Atlético Madrid", p: 38, w: 24, d: 8, l: 6, gf: 65, ga: 30, pts: 80, form: ["D","W","W","L","W"] },
  { pos: 4, team: "Athletic Club", p: 38, w: 21, d: 9, l: 8, gf: 58, ga: 37, pts: 72, form: ["W","D","W","W","L"] },
  { pos: 5, team: "Real Sociedad", p: 38, w: 19, d: 8, l: 11, gf: 51, ga: 39, pts: 65, form: ["L","W","D","W","W"] },
  { pos: 6, team: "Villarreal", p: 38, w: 18, d: 7, l: 13, gf: 62, ga: 52, pts: 61, form: ["W","W","L","D","W"] },
  { pos: 7, team: "Real Betis", p: 38, w: 16, d: 10, l: 12, gf: 48, ga: 45, pts: 58, form: ["D","L","W","W","D"] },
  { pos: 8, team: "Girona", p: 38, w: 15, d: 9, l: 14, gf: 55, ga: 53, pts: 54, form: ["L","W","D","L","W"] },
];

const MATCHES = [
  { home: "Real Madrid", away: "Barcelona", hs: 3, as: 1, date: "Mar 2", comp: "La Liga", events: [
    { min: 12, type: "goal", player: "Vinícius Jr", team: "home" },
    { min: 34, type: "goal", player: "Bellingham", team: "home" },
    { min: 52, type: "goal", player: "Raphinha", team: "away" },
    { min: 78, type: "goal", player: "Mbappé", team: "home" },
  ], stats: { possession: [58, 42], shots: [18, 9], shotsOnTarget: [8, 3], passes: [612, 445], corners: [7, 3], xG: [2.8, 0.9] }},
  { home: "Atlético Madrid", away: "Real Madrid", hs: 1, as: 2, date: "Feb 15", comp: "La Liga", events: [
    { min: 23, type: "goal", player: "Griezmann", team: "home" },
    { min: 41, type: "goal", player: "Bellingham", team: "away" },
    { min: 88, type: "goal", player: "Vinícius Jr", team: "away" },
  ], stats: { possession: [46, 54], shots: [11, 15], shotsOnTarget: [4, 7], passes: [398, 520], corners: [4, 6], xG: [1.2, 2.1] }},
  { home: "Real Madrid", away: "Man City", hs: 3, as: 2, date: "Apr 9", comp: "UCL QF", events: [
    { min: 8, type: "goal", player: "Mbappé", team: "home" },
    { min: 29, type: "goal", player: "Haaland", team: "away" },
    { min: 55, type: "goal", player: "Vinícius Jr", team: "home" },
    { min: 67, type: "goal", player: "De Bruyne", team: "away" },
    { min: 90, type: "goal", player: "Bellingham", team: "home" },
  ], stats: { possession: [51, 49], shots: [16, 14], shotsOnTarget: [7, 6], passes: [548, 531], corners: [5, 8], xG: [2.6, 2.3] }},
];

const PLAYERS = [
  { name: "Vinícius Jr", pos: "LW", age: 26, goals: 22, assists: 11, xG: 19.4, xA: 8.7, passAcc: 82, dribbles: 156, minutes: 3120, rating: 8.4 },
  { name: "Jude Bellingham", pos: "CM", age: 22, goals: 18, assists: 14, xG: 14.2, xA: 11.8, passAcc: 89, dribbles: 67, minutes: 3340, rating: 8.2 },
  { name: "Kylian Mbappé", pos: "CF", age: 27, goals: 26, assists: 8, xG: 24.1, xA: 6.3, passAcc: 78, dribbles: 98, minutes: 3050, rating: 8.1 },
  { name: "Rodrygo", pos: "RW", age: 25, goals: 12, assists: 9, xG: 10.8, xA: 7.5, passAcc: 85, dribbles: 72, minutes: 2680, rating: 7.6 },
];

const TRANSFERS = [
  { player: "Kylian Mbappé", from: "PSG", to: "Real Madrid", fee: "Free", date: "Jul 2024", mktValue: "€180M", status: "completed" },
  { player: "Arda Güler", from: "Fenerbahçe", to: "Real Madrid", fee: "€20M", date: "Jul 2023", mktValue: "€35M", status: "completed" },
  { player: "Toni Kroos", from: "Real Madrid", to: "Retired", fee: "-", date: "Jun 2024", mktValue: "-", status: "completed" },
  { player: "Alphonso Davies", from: "Bayern Munich", to: "Real Madrid", fee: "€45M", date: "Jul 2025", mktValue: "€50M", status: "completed" },
  { player: "Leny Yoro", from: "Man United", to: "Real Madrid", fee: "€60M", date: "Jan 2026", mktValue: "€55M", status: "rumour" },
  { player: "Florian Wirtz", from: "B. Leverkusen", to: "Real Madrid", fee: "€120M", date: "Jul 2026", mktValue: "€130M", status: "rumour" },
];

const PIPELINES = [
  { name: "dag_ingest_football_data", status: "success", lastRun: "2 min ago", duration: "1m 23s", nextRun: "6 min", records: "1,247" },
  { name: "dag_ingest_statsbomb", status: "success", lastRun: "4h ago", duration: "8m 12s", nextRun: "20h", records: "342,891" },
  { name: "dag_spark_streaming_live", status: "running", lastRun: "now", duration: "continuous", nextRun: "-", records: "89/s" },
  { name: "dag_spark_batch_daily", status: "success", lastRun: "6h ago", duration: "12m 45s", nextRun: "18h", records: "28,456" },
  { name: "dag_dbt_transform", status: "success", lastRun: "5h ago", duration: "4m 33s", nextRun: "19h", records: "-" },
  { name: "dag_data_quality", status: "warning", lastRun: "5h ago", duration: "2m 10s", nextRun: "19h", records: "3 checks failed" },
  { name: "dag_transfer_cdc", status: "success", lastRun: "30 min ago", duration: "0m 48s", nextRun: "30 min", records: "12" },
];

const DQ_CHECKS = [
  { table: "fct_matches", check: "Row count > 0", status: "pass", value: "4,218 rows" },
  { table: "fct_matches", check: "No null match_ids", status: "pass", value: "0 nulls" },
  { table: "fct_player_match_stats", check: "minutes_played <= 120", status: "fail", value: "3 violations" },
  { table: "dim_players", check: "Unique player_id", status: "pass", value: "2,847 unique" },
  { table: "dim_teams", check: "All teams have league_id", status: "pass", value: "100% populated" },
  { table: "stg_match_events", check: "Event timestamps ordered", status: "warn", value: "2 out of order" },
  { table: "fct_transfers", check: "Fee >= 0 or null", status: "fail", value: "1 negative fee" },
];

const INSIGHTS_CHAT = [
  { role: "user", text: "How has Bellingham's role changed compared to last season?" },
  { role: "ai", text: "Based on match event data across 2 seasons:\n\nBellingham's average position has shifted forward by ~8 meters compared to last season. His heatmap shows significantly more presence in the final third (62% of touches vs 44% last season). His xG per 90 rose from 0.31 to 0.49, while his progressive passes dropped from 7.2 to 5.1 per 90 — suggesting a deliberate tactical shift from box-to-box to a more advanced attacking role, likely influenced by Mbappé's arrival freeing him from the false 9 responsibilities he carried early last season." },
  { role: "user", text: "Compare Vinícius Jr's dribbling to the top 5 dribblers in La Liga" },
  { role: "ai", text: "Query executed against Gold layer → fct_player_match_stats:\n\nVinícius Jr leads La Liga with 156 successful dribbles this season (4.5 per 90), followed by Nico Williams (132), Raphinha (118), Sávio (104), and Yamal (98). His success rate of 68% is 2nd only to Williams (71%). What's notable is the xG generated from dribble sequences — Vinícius creates 0.38 xG per successful dribble that leads to a shot, nearly double the league average of 0.21. This confirms he's not just dribbling for show — he's the most dangerous carrier in the league." },
];

const formColor = (r) => r === "W" ? "#16a34a" : r === "D" ? "#d97706" : "#dc2626";

function StatBar({ label, home, away, max }) {
  const total = max || Math.max(home, away) || 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0", fontSize: 12 }}>
      <span style={{ width: 30, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{home}</span>
      <div style={{ flex: 1, display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "#e8e6df" }}>
        <div style={{ width: `${(home / (home + away || 1)) * 100}%`, background: "#1d4ed8", borderRadius: "3px 0 0 3px" }} />
        <div style={{ width: `${(away / (home + away || 1)) * 100}%`, background: "#9333ea", borderRadius: "0 3px 3px 0" }} />
      </div>
      <span style={{ width: 30, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{away}</span>
      <span style={{ width: 90, color: "#78716c", fontSize: 11 }}>{label}</span>
    </div>
  );
}

function Overview() {
  return (
    <div>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Matches ingested", value: "4,218", delta: "+47 today" },
          { label: "Events processed", value: "1.2M", delta: "+89K today" },
          { label: "Players tracked", value: "2,847", delta: "across 12 leagues" },
          { label: "Pipeline uptime", value: "99.4%", delta: "last 30 days" },
        ].map((k, i) => (
          <div key={i} style={{ padding: "16px 14px", border: "1px solid #e7e5e4", borderRadius: 10, background: "#fafaf9" }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-1px", color: "#1c1917" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "#78716c", marginTop: 2 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 4 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Standings */}
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#44403c" }}>La Liga 2025–26</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e7e5e4" }}>
              {["#","Team","P","W","D","L","GF","GA","Pts","Form"].map(h => (
                <th key={h} style={{ padding: "6px 6px", textAlign: h === "Team" ? "left" : "center", color: "#78716c", fontWeight: 500, fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STANDINGS.map((t, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f5f5f4", background: t.team === "Real Madrid" ? "#fef9ee" : "transparent" }}>
                <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: 600, color: i < 4 ? "#1d4ed8" : "#78716c" }}>{t.pos}</td>
                <td style={{ padding: "8px 6px", fontWeight: t.team === "Real Madrid" ? 700 : 500 }}>{t.team}</td>
                {[t.p, t.w, t.d, t.l, t.gf, t.ga].map((v, j) => (
                  <td key={j} style={{ padding: "8px 4px", textAlign: "center", fontVariantNumeric: "tabular-nums", color: "#57534e" }}>{v}</td>
                ))}
                <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: 700, color: "#1c1917" }}>{t.pts}</td>
                <td style={{ padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                    {t.form.map((r, j) => (
                      <span key={j} style={{ width: 16, height: 16, borderRadius: 3, background: formColor(r), color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{r}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Medallion layer stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 24 }}>
        {[
          { layer: "Bronze", rows: "12.4M", tables: 7, fresh: "2 min ago", color: "#b45309", bg: "#fef3c7" },
          { layer: "Silver", rows: "8.1M", tables: 12, fresh: "6h ago", color: "#1d4ed8", bg: "#dbeafe" },
          { layer: "Gold", rows: "2.3M", tables: 8, fresh: "6h ago", color: "#15803d", bg: "#dcfce7" },
        ].map((l, i) => (
          <div key={i} style={{ padding: 14, borderRadius: 10, background: l.bg, border: `1px solid ${l.color}22` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.layer}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: l.color, marginTop: 4 }}>{l.rows}</div>
            <div style={{ fontSize: 11, color: l.color, opacity: 0.7, marginTop: 2 }}>{l.tables} tables · updated {l.fresh}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCenter() {
  const [selected, setSelected] = useState(0);
  const m = MATCHES[selected];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {MATCHES.map((mt, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding: "10px 14px", borderRadius: 8, border: selected === i ? "2px solid #1d4ed8" : "1px solid #e7e5e4",
            background: selected === i ? "#eff6ff" : "#fafaf9", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, fontWeight: 500, minWidth: 160
          }}>
            <div style={{ fontWeight: 600 }}>{mt.home} {mt.hs} – {mt.as} {mt.away}</div>
            <div style={{ color: "#78716c", fontSize: 11, marginTop: 2 }}>{mt.comp} · {mt.date}</div>
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, padding: "20px 0", background: "#1c1917", borderRadius: 12, marginBottom: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fafaf9" }}>{m.home}</div>
          <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 2 }}>Home</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: "#fafaf9", letterSpacing: 4, fontVariantNumeric: "tabular-nums" }}>
          {m.hs} – {m.as}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fafaf9" }}>{m.away}</div>
          <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 2 }}>Away</div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fafaf9", borderRadius: 10, border: "1px solid #e7e5e4" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 8 }}>Match timeline</div>
        <div style={{ position: "relative", height: 40, background: "#e8e6df", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#a8a29e" }} />
          {m.events.map((e, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${(e.min / 95) * 100}%`,
              top: e.team === "home" ? 2 : 22,
              width: 16, height: 16, borderRadius: "50%",
              background: e.team === "home" ? "#1d4ed8" : "#9333ea",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, color: "#fff", fontWeight: 700
            }}>{e.min}'</div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#a8a29e", marginTop: 4 }}>
          <span>0'</span><span>HT</span><span>90'</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "12px 14px", background: "#fafaf9", borderRadius: 10, border: "1px solid #e7e5e4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}>{m.home}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#9333ea" }}>{m.away}</span>
        </div>
        <StatBar label="Possession" home={m.stats.possession[0]} away={m.stats.possession[1]} />
        <StatBar label="Shots" home={m.stats.shots[0]} away={m.stats.shots[1]} />
        <StatBar label="On target" home={m.stats.shotsOnTarget[0]} away={m.stats.shotsOnTarget[1]} />
        <StatBar label="Passes" home={m.stats.passes[0]} away={m.stats.passes[1]} />
        <StatBar label="Corners" home={m.stats.corners[0]} away={m.stats.corners[1]} />
        <StatBar label="xG" home={m.stats.xG[0]} away={m.stats.xG[1]} />
      </div>

      {/* Source tag */}
      <div style={{ marginTop: 12, fontSize: 10, color: "#a8a29e" }}>
        Source: fct_matches (Gold) → joined with fct_player_match_stats · Pipeline: dag_spark_batch_daily · Last refresh: 6h ago
      </div>
    </div>
  );
}

function PlayerLab() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(2);
  const a = PLAYERS[p1];
  const b = PLAYERS[p2];

  const CompareRow = ({ label, va, vb, higher = "better" }) => {
    const aWins = higher === "better" ? va > vb : va < vb;
    const bWins = !aWins && va !== vb;
    return (
      <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f4" }}>
        <span style={{ flex: 1, textAlign: "right", fontWeight: aWins ? 700 : 400, color: aWins ? "#1d4ed8" : "#57534e", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{va}</span>
        <span style={{ width: 100, textAlign: "center", fontSize: 11, color: "#78716c" }}>{label}</span>
        <span style={{ flex: 1, fontWeight: bWins ? 700 : 400, color: bWins ? "#9333ea" : "#57534e", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{vb}</span>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select value={p1} onChange={e => setP1(+e.target.value)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "2px solid #1d4ed8", fontSize: 13, fontWeight: 600, background: "#eff6ff" }}>
          {PLAYERS.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
        </select>
        <span style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: "#a8a29e" }}>vs</span>
        <select value={p2} onChange={e => setP2(+e.target.value)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "2px solid #9333ea", fontSize: 13, fontWeight: 600, background: "#faf5ff" }}>
          {PLAYERS.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 8px", borderBottom: "2px solid #e7e5e4" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1d4ed8" }}>{a.name}</div>
          <div style={{ fontSize: 11, color: "#78716c" }}>{a.pos} · Age {a.age}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#9333ea" }}>{b.name}</div>
          <div style={{ fontSize: 11, color: "#78716c" }}>{b.pos} · Age {b.age}</div>
        </div>
      </div>

      <CompareRow label="Goals" va={a.goals} vb={b.goals} />
      <CompareRow label="Assists" va={a.assists} vb={b.assists} />
      <CompareRow label="xG" va={a.xG} vb={b.xG} />
      <CompareRow label="xA" va={a.xA} vb={b.xA} />
      <CompareRow label="Pass accuracy" va={`${a.passAcc}%`} vb={`${b.passAcc}%`} />
      <CompareRow label="Dribbles" va={a.dribbles} vb={b.dribbles} />
      <CompareRow label="Minutes" va={a.minutes.toLocaleString()} vb={b.minutes.toLocaleString()} />
      <CompareRow label="Rating" va={a.rating} vb={b.rating} />

      <div style={{ marginTop: 16, padding: 12, background: "#fafaf9", borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 11, color: "#78716c" }}>
        Data source: dim_players (SCD Type 2) joined with fct_player_match_stats · Transformed by dbt model: marts/player_season_summary.sql
      </div>
    </div>
  );
}

function TransferTracker() {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#44403c" }}>Real Madrid transfer activity</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TRANSFERS.map((t, i) => (
          <div key={i} style={{
            padding: "12px 14px", borderRadius: 10, border: "1px solid #e7e5e4",
            background: t.status === "rumour" ? "#fefce8" : "#fafaf9",
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8
          }}>
            <div style={{ flex: "1 1 180px" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.player}</div>
              <div style={{ fontSize: 12, color: "#78716c", marginTop: 2 }}>{t.from} → {t.to}</div>
            </div>
            <div style={{ flex: "0 0 80px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1917" }}>{t.fee}</div>
              <div style={{ fontSize: 10, color: "#a8a29e" }}>Fee</div>
            </div>
            <div style={{ flex: "0 0 80px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#57534e" }}>{t.mktValue}</div>
              <div style={{ fontSize: 10, color: "#a8a29e" }}>Market value</div>
            </div>
            <div style={{ flex: "0 0 70px", textAlign: "center" }}>
              <span style={{
                padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: t.status === "completed" ? "#dcfce7" : "#fef9c3",
                color: t.status === "completed" ? "#15803d" : "#a16207"
              }}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 10, color: "#a8a29e" }}>
        Source: fct_transfers (Gold) · CDC via Debezium → Kafka topic: raw.transfers · dim_players updated with SCD Type 2 on club change
      </div>
    </div>
  );
}

function PipelineHealth() {
  const [showDQ, setShowDQ] = useState(false);
  const statusIcon = (s) => s === "success" ? "✓" : s === "running" ? "↻" : s === "warning" ? "!" : "✕";
  const statusColor = (s) => s === "success" ? "#16a34a" : s === "running" ? "#2563eb" : s === "warning" ? "#d97706" : "#dc2626";

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setShowDQ(false)} style={{ padding: "8px 16px", borderRadius: 6, border: !showDQ ? "2px solid #1c1917" : "1px solid #e7e5e4", background: !showDQ ? "#1c1917" : "#fafaf9", color: !showDQ ? "#fafaf9" : "#44403c", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Airflow DAGs</button>
        <button onClick={() => setShowDQ(true)} style={{ padding: "8px 16px", borderRadius: 6, border: showDQ ? "2px solid #1c1917" : "1px solid #e7e5e4", background: showDQ ? "#1c1917" : "#fafaf9", color: showDQ ? "#fafaf9" : "#44403c", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Data quality</button>
      </div>

      {!showDQ ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {PIPELINES.map((p, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e7e5e4", background: "#fafaf9", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", background: statusColor(p.status), flexShrink: 0 }}>{statusIcon(p.status)}</span>
              <div style={{ flex: "1 1 200px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#78716c", marginTop: 1 }}>Ran {p.lastRun} · took {p.duration}</div>
              </div>
              <div style={{ flex: "0 0 100px", fontSize: 11, color: "#78716c", textAlign: "right" }}>
                <div>Next: {p.nextRun}</div>
                <div style={{ color: "#a8a29e" }}>{p.records} records</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Passed", count: DQ_CHECKS.filter(c => c.status === "pass").length, color: "#16a34a", bg: "#dcfce7" },
              { label: "Warnings", count: DQ_CHECKS.filter(c => c.status === "warn").length, color: "#d97706", bg: "#fef3c7" },
              { label: "Failed", count: DQ_CHECKS.filter(c => c.status === "fail").length, color: "#dc2626", bg: "#fee2e2" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: s.bg, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 11, color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>
          {DQ_CHECKS.map((c, i) => (
            <div key={i} style={{ padding: "8px 12px", borderBottom: "1px solid #f5f5f4", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.status === "pass" ? "#16a34a" : c.status === "warn" ? "#d97706" : "#dc2626", flexShrink: 0 }} />
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#57534e", flex: "0 0 170px" }}>{c.table}</span>
              <span style={{ flex: 1 }}>{c.check}</span>
              <span style={{ fontSize: 11, color: "#78716c" }}>{c.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 10, color: "#a8a29e" }}>
            Checks powered by Great Expectations · Orchestrated by dag_data_quality in Airflow
          </div>
        </div>
      )}
    </div>
  );
}

function AIInsights() {
  const [input, setInput] = useState("");
  return (
    <div>
      <div style={{ padding: "12px 14px", background: "#fef9ee", borderRadius: 10, border: "1px solid #fde68a", marginBottom: 16, fontSize: 12, color: "#92400e" }}>
        RAG pipeline: Match reports and commentary → embeddings → vector DB → Claude API for synthesis. Queries your Gold layer tables for stats, then enriches with unstructured context.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {INSIGHTS_CHAT.map((msg, i) => (
          <div key={i} style={{
            padding: "12px 14px", borderRadius: 10, maxWidth: "92%",
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            background: msg.role === "user" ? "#1c1917" : "#fafaf9",
            color: msg.role === "user" ? "#fafaf9" : "#1c1917",
            border: msg.role === "ai" ? "1px solid #e7e5e4" : "none",
            fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line"
          }}>
            {msg.role === "ai" && <div style={{ fontSize: 10, color: "#a8a29e", marginBottom: 6, fontWeight: 600 }}>RAG + Gold layer query</div>}
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about any player, match, or trend..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #d6d3d1", fontSize: 13, outline: "none" }}
        />
        <button style={{ padding: "10px 16px", borderRadius: 8, background: "#1c1917", color: "#fafaf9", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Send</button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {["Top xG underperformers", "Season form curve for Madrid", "Which dbt model feeds this?"].map((q, i) => (
          <button key={i} onClick={() => setInput(q)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e7e5e4", background: "#fafaf9", fontSize: 11, color: "#57534e", cursor: "pointer" }}>{q}</button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 780, margin: "0 auto", padding: "20px 16px", color: "#1c1917" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>Football Analytics Platform</span>
          <span style={{ fontSize: 11, color: "#a8a29e", fontWeight: 500 }}>demo</span>
        </div>
        <div style={{ fontSize: 12, color: "#78716c", marginTop: 2 }}>Kafka → Spark → Delta Lake → dbt → Serving</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, overflowX: "auto", borderBottom: "2px solid #e7e5e4", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 14px", fontSize: 12, fontWeight: tab === t ? 700 : 500,
            color: tab === t ? "#1c1917" : "#78716c",
            background: "none", border: "none", cursor: "pointer",
            borderBottom: tab === t ? "2px solid #1c1917" : "2px solid transparent",
            marginBottom: -2, whiteSpace: "nowrap"
          }}>{TAB_LABELS[t]}</button>
        ))}
      </div>

      {/* Content */}
      {tab === "overview" && <Overview />}
      {tab === "matches" && <MatchCenter />}
      {tab === "players" && <PlayerLab />}
      {tab === "transfers" && <TransferTracker />}
      {tab === "pipeline" && <PipelineHealth />}
      {tab === "insights" && <AIInsights />}
    </div>
  );
}
