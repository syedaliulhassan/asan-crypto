"use client";
import { useState } from "react";

const QUICK_CRYPTOS = ["Bitcoin", "Ethereum", "Solana", "Chainlink", "NEAR", "Render", "Avalanche", "Polkadot"];

// ── tiny helpers ──────────────────────────────────────────────
const getRiskColor = (r = "") => {
  const v = r.toLowerCase();
  if (v.includes("very high")) return "#ef4444";
  if (v.includes("high")) return "#f97316";
  if (v.includes("medium")) return "#f59e0b";
  if (v.includes("low")) return "#22c55e";
  return "#94a3b8";
};

const getVerdictStyle = (v = "") => {
  const val = v.toLowerCase();
  if (val.includes("halal") || val.includes("permitted") || val.includes("acceptable"))
    return { bg: "#052e16", border: "#16a34a", color: "#4ade80", icon: "✅" };
  if (val.includes("haram") || val.includes("prohibited") || val.includes("avoid"))
    return { bg: "#2d0a0a", border: "#dc2626", color: "#f87171", icon: "❌" };
  return { bg: "#1c1506", border: "#d97706", color: "#fbbf24", icon: "⚠️" };
};

const getSentimentStyle = (s = "") => {
  const val = s.toLowerCase();
  if (val.includes("bullish")) return { color: "#4ade80", bg: "#052e16", border: "#16a34a", icon: "▲" };
  if (val.includes("bearish")) return { color: "#f87171", bg: "#2d0a0a", border: "#dc2626", icon: "▼" };
  return { color: "#fbbf24", bg: "#1c1506", border: "#d97706", icon: "◆" };
};

// ── sub-components ─────────────────────────────────────────────
const ScoreRing = ({ score, size = 64, color = "#38bdf8" }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    <svg width={size} height={size} viewBox={0 0 ${size} ${size}} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="none" stroke="#1e293b" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={size / 2 - 4}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={${((size / 2 - 4) * 2 * Math.PI)}}
        strokeDashoffset={${((size / 2 - 4) * 2 * Math.PI) * (1 - score / 10)}}
        strokeLinecap="round"
      />
    </svg>
    <div style={{
      position: "absolute", inset: 0, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center"
    }}>
      <span style={{ fontFamily: "'Bebas Neue'", fontSize: size * 0.3, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: size * 0.14, color: "#475569", fontFamily: "'Space Mono', monospace" }}>/10</span>
    </div>
  </div>
);

const ScoreBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'Space Mono', monospace" }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{value}/10</span>
    </div>
    <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: ${value * 10}%,
        background: linear-gradient(90deg,${color}66,${color}),
        borderRadius: 3, transition: "width 1.2s ease",
        boxShadow: 0 0 6px ${color}55
      }} />
    </div>
  </div>
);

const InfoRow = ({ label, value, highlight }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "9px 0", borderBottom: "1px solid #0f172a", gap: 12
  }}>
    <span style={{ fontSize: 12, color: "#475569", minWidth: 130, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 12, color: highlight || "#cbd5e1", textAlign: "right", lineHeight: 1.5 }}>{value}</span>
  </div>
);

const SectionTitle = ({ icon, title }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "'Space Mono', monospace", fontSize: 10,
    textTransform: "uppercase", letterSpacing: "2px",
    color: "#38bdf8", marginBottom: 14,
    borderBottom: "1px solid #1e293b", paddingBottom: 10
  }}>
    <span>{icon}</span>{title}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#080f1e", border: "1px solid #1a2640",
    borderRadius: 14, padding: 18, marginBottom: 12, ...style
  }}>
    {children}
  </div>
);

const TFBadge = ({ tf, sentiment }) => {
  const s = getSentimentStyle(sentiment);
  return (
    <div style={{
      background: s.bg, border: 1px solid ${s.border},
      borderRadius: 10, padding: "10px 12px", textAlign: "center", flex: 1
    }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#475569", marginBottom: 4 }}>{tf}</div>
      <div style={{ fontSize: 16 }}>{s.icon}</div>
      <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginTop: 3 }}>{sentiment}</div>
    </div>
  );
};

const ExchangeBadge = ({ name }) => (
  <span style={{
    background: "#0f1f35", border: "1px solid #1e3a5f",
    borderRadius: 6, padding: "4px 10px",
    fontSize: 11, color: "#94a3b8",
    fontFamily: "'Space Mono', monospace"
  }}>{name}</span>
);

const LoadingPulse = () => (
  <div style={{ textAlign: "center", padding: "56px 20px" }}>
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 4, borderRadius: 4,
          background: "#38bdf8",
          animation: barPulse 1s ease-in-out ${i * 0.15}s infinite alternate,
          height: 32
        }} />
      ))}
    </div>
    <p style={{ color: "#334155", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
      ANALYZING PROJECT DATA...
    </p>
  </div>
);

// ── main component ─────────────────────────────────────────────
export default function AsanCrypto() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "tokenomics", label: "Tokenomics" },
    { id: "technical", label: "Technical" },
    { id: "market", label: "Market" },
    { id: "religious", label: "Religion" },
  ];

  const analyze = async (name) => {
    const project = name || query.trim();
    if (!project) return;
    setLoading(true); setError(null); setResult(null); setActiveTab("overview");

    const prompt = `You are a professional crypto research analyst. Analyze the cryptocurrency project: "${project}".

Return ONLY valid JSON (no markdown, no backticks, no extra text) with this exact structure:

{
  "name": "Full project name",
  "symbol": "TICKER",
  "tagline": "One sentence description",
  "category": "Layer1/Layer2/DeFi/NFT/GameFi/Oracle/etc",
  "riskLevel": "Low/Medium/High/Very High",
  "overallScore": 7,
  "founded": "Year",
  "blockchain": "Own chain / Ethereum / Solana / etc",
  "consensus": "PoS/PoW/DPoS/etc",
  "website": "official website domain only",

  "marketData": {
    "priceRange30d": "e.g. $18 - $32 (approx last 30 days)",
    "marketCapCategory": "Large Cap >$10B / Mid Cap $1-10B / Small Cap <$1B",
    "volume24h": "Approximate 24h volume",
    "allTimeHigh": "Approximate ATH price",
    "exchanges": ["Binance", "Coinbase", "OKX", "Bybit", "Kraken"],
    "twitterFollowers": "e.g. 3.2M",
    "telegramMembers": "e.g. 450K or N/A",
    "githubStars": "e.g. 12K or N/A",
    "last30dChange": "e.g. +12% or -8% (approximate)"
  },

  "fundamentals": {
    "score": 8,
    "team": "Team description",
    "useCase": "What problem it solves",
    "technology": "Core tech innovation",
    "adoption": "Partnerships and real usage",
    "competition": "Main competitors",
    "roadmap": "Current roadmap status"
  },

  "tokenomics": {
    "score": 7,
    "totalSupply": "Total supply",
    "circulatingSupply": "Circulating supply",
    "distribution": "How distributed among team/investors/public",
    "vestingSchedule": "Vesting details",
    "upcomingUnlocks": "Next major unlock events",
    "inflationModel": "Inflationary/Deflationary/Fixed",
    "stakingYield": "APY if applicable or N/A"
  },

  "investors": {
    "score": 8,
    "tier": "Tier 1/Tier 2/Unknown",
    "notableVCs": ["VC1", "VC2", "VC3"],
    "totalRaised": "Total funding",
    "lastRound": "Latest round details"
  },

  "technical": {
    "score": 7,
    "tps": "Transactions per second",
    "finality": "Transaction finality time",
    "security": "Security model",
    "decentralization": "Level of decentralization",
    "openSource": true,
    "audits": "Audit firms and status",
    "tvl": "Total Value Locked if DeFi, else N/A"
  },

  "indicators": {
    "4h": { "rsi": "e.g. 58", "macd": "Bullish/Bearish/Neutral", "ema": "Above/Below 200 EMA", "sentiment": "Bullish/Bearish/Neutral", "summary": "Short 1 line" },
    "1d": { "rsi": "e.g. 52", "macd": "Bullish/Bearish/Neutral", "ema": "Above/Below 200 EMA", "sentiment": "Bullish/Bearish/Neutral", "summary": "Short 1 line" },
    "1w": { "rsi": "e.g. 61", "macd": "Bullish/Bearish/Neutral", "ema": "Above/Below 200 EMA", "sentiment": "Bullish/Bearish/Neutral", "summary": "Short 1 line" },
    "1m": { "rsi": "e.g. 55", "macd": "Bullish/Bearish/Neutral", "ema": "Above/Below 200 EMA", "sentiment": "Bullish/Bearish/Neutral", "summary": "Short 1 line" }
  },

  "sentiment": {
    "score": 6,
    "community": "Community strength description",
    "developerActivity": "High/Medium/Low + details",
    "recentNews": "Latest notable development"
  },

  "religious": {
    "islam": {
      "verdict": "Halal/Haram/Controversial",
      "shortReason": "One line reason",
      "details": "Detailed Islamic finance analysis — riba, maisir, gharar, real utility check",
      "scholarView": "Known scholar opinions if any",
      "conditions": "Conditions under which it may be permissible"
    },
    "christianity": {
      "verdict": "Permitted/Cautioned/Prohibited",
      "shortReason": "One line reason",
      "details": "Biblical principles analysis — stewardship, honesty, speculation",
      "conditions": "Guidance for Christian investors"
    },
    "hinduism": {
      "verdict": "Acceptable/Cautioned/Avoid",
      "shortReason": "One line reason",
      "details": "Dharmic principles — artha, honest earning, avoiding lobh (greed)",
      "conditions": "Guidance for Hindu investors"
    }
  },

  "prosAndCons": {
    "pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4"],
    "cons": ["Con 1", "Con 2", "Con 3"]
  },

  "investmentSummary": "3-4 sentence comprehensive investment thesis",
  "disclaimer": "This analysis is for educational purposes only. Not financial or religious advice. Always do your own research and consult qualified advisors."
}`;

    try {
     const res = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ project })
});
const data = await res.json();
setResult(data);
    } catch {
      setError("Analysis failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── render ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#030811", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes barPulse{from{height:8px}to{height:32px}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .fade-up{animation:fadeUp 0.35s ease forwards}
        .inp{background:#080f1e;border:1.5px solid #1a2640;color:#e2e8f0;border-radius:12px;padding:13px 16px;font-size:15px;width:100%;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .2s}
        .inp:focus{border-color:#38bdf8}
        .inp::placeholder{color:#334155}
        .btn-primary{background:linear-gradient(135deg,#0284c7,#38bdf8);color:#020c1a;border:none;border-radius:12px;padding:13px 24px;font-weight:700;font-size:14px;cursor:pointer;font-family:'Space Mono',monospace;letter-spacing:.5px;transition:opacity .2s,transform .1s;white-space:nowrap}
        .btn-primary:hover{opacity:.9;transform:translateY(-1px)}
        .btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .chip{background:#080f1e;border:1px solid #1a2640;color:#64748b;border-radius:20px;padding:5px 13px;font-size:11px;cursor:pointer;font-family:'Space Mono',monospace;transition:all .2s}
        .chip:hover{background:#1e3a5f;color:#38bdf8;border-color:#38bdf8}
        .tab{background:transparent;border:none;padding:9px 14px;font-size:12px;cursor:pointer;font-family:'Space Mono',monospace;color:#334155;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
        .tab.active{color:#38bdf8;border-bottom-color:#38bdf8}
        .tab:hover:not(.active){color:#64748b}
        .info-row:last-child{border-bottom:none!important}
        ::-webkit-scrollbar{height:3px;width:3px}
        ::-webkit-scrollbar-track{background:#030811}
        ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
      `}</style>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", padding: "24px 0 28px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#0c1929", border: "1px solid #1e3a5f",
            borderRadius: 8, padding: "5px 14px", marginBottom: 14
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", display: "inline-block", animation: "barPulse 1s ease infinite alternate" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#38bdf8", letterSpacing: 2 }}>AI-POWERED RESEARCH</span>
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(48px,12vw,80px)",
            letterSpacing: 4, lineHeight: 1, marginBottom: 8,
            background: "linear-gradient(135deg,#f1f5f9 20%,#38bdf8 80%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>ASAN CRYPTO</h1>
          <p style={{ color: "#334155", fontSize: 13, fontWeight: 300 }}>Complete crypto research — fundamentals, technicals, halal status & more</p>
        </div>

        {/* ── SEARCH ── */}
        <Card style={{ border: "1px solid #1e3a5f", boxShadow: "0 0 30px #0ea5e910" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input className="inp" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter any crypto project (e.g. Solana, Chainlink...)"
              onKeyDown={e => e.key === "Enter" && analyze()} />
            <button className="btn-primary" onClick={() => analyze()} disabled={loading || !query.trim()}>
              {loading ? "..." : "ANALYZE"}
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#1e3a5f", fontFamily: "'Space Mono', monospace" }}>QUICK:</span>
            {QUICK_CRYPTOS.map(c => (
              <button key={c} className="chip" onClick={() => { setQuery(c); analyze(c); }}>{c}</button>
            ))}
          </div>
        </Card>

        {loading && <Card><LoadingPulse /></Card>}
        {error && <Card style={{ borderColor: "#ef444433" }}><p style={{ color: "#ef4444", textAlign: "center", fontSize: 13 }}>{error}</p></Card>}

        {result && !loading && (
          <div className="fade-up">

            {/* ── PROJECT HERO ── */}
            <Card style={{ background: "linear-gradient(135deg,#060e1c,#0c1929)", border: "1px solid #1e3a5f" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2, color: "#f1f5f9" }}>{result.name}</h2>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#38bdf8",
                      background: "#0c2a45", border: "1px solid #1e4d7a", borderRadius: 6, padding: "2px 9px"
                    }}>${result.symbol}</span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>{result.tagline}</p>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ background: "#0c2a45", border: "1px solid #1e4d7a", color: "#38bdf8", borderRadius: 20, padding: "3px 11px", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{result.category}</span>
                    <span style={{
                      background: getRiskColor(result.riskLevel) + "18",
                      border: 1px solid ${getRiskColor(result.riskLevel)}44,
                      color: getRiskColor(result.riskLevel),
                      borderRadius: 20, padding: "3px 11px", fontSize: 11, fontFamily: "'Space Mono', monospace"
                    }}>{result.riskLevel} Risk</span>
                    <span style={{ background: "#1a0a2e", border: "1px solid #3b1d6e", color: "#a78bfa", borderRadius: 20, padding: "3px 11px", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{result.blockchain}</span>
                  </div>
                </div>
                <ScoreRing score={result.overallScore} size={76} color="#38bdf8" />
              </div>

              {/* quick market strip */}
              {result.marketData && (
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))",
                  gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a2640"
                }}>
                  {[
                    { label: "30D Range", val: result.marketData.priceRange30d },
                    { label: "30D Change", val: result.marketData.last30dChange, highlight: result.marketData.last30dChange?.includes("+") ? "#4ade80" : "#f87171" },
                    { label: "Market Cap", val: result.marketData.marketCapCategory },
                    { label: "Twitter", val: 🐦 ${result.marketData.twitterFollowers} },
                  ].map(({ label, val, highlight }) => (
                    <div key={label} style={{ background: "#04090f", borderRadius: 8, padding: "9px 10px", border: "1px solid #1a2640" }}>
                      <div style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono', monospace", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 12, color: highlight || "#94a3b8", fontWeight: 600 }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ── SCORE BARS ── */}
            <Card>
              <SectionTitle icon="◆" title="Score Breakdown" />
              <ScoreBar label="Fundamentals" value={result.fundamentals?.score || 0} color="#38bdf8" />
              <ScoreBar label="Tokenomics" value={result.tokenomics?.score || 0} color="#a78bfa" />
              <ScoreBar label="Investors" value={result.investors?.score || 0} color="#34d399" />
              <ScoreBar label="Technical" value={result.technical?.score || 0} color="#fb923c" />
              <ScoreBar label="Sentiment" value={result.sentiment?.score || 0} color="#f472b6" />
            </Card>

            {/* ── TABS ── */}
            <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #1a2640", marginBottom: 12, gap: 2 }}>
              {TABS.map(t => (
                <button key={t.id} className={tab ${activeTab === t.id ? "active" : ""}} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── TAB: OVERVIEW ── */}
            {activeTab === "overview" && (
              <div className="fade-up">
                <Card>
                  <SectionTitle icon="🏗️" title="Fundamentals" />
                  {[
                    ["Use Case", result.fundamentals?.useCase],
                    ["Technology", result.fundamentals?.technology],
                    ["Team", result.fundamentals?.team],
                    ["Adoption", result.fundamentals?.adoption],
                    ["Competition", result.fundamentals?.competition],
                    ["Roadmap", result.fundamentals?.roadmap],
                  ].map(([l, v]) => v && <InfoRow key={l} label={l} value={v} />)}
                </Card>

                <Card>
                  <SectionTitle icon="🏦" title="Investors & Funding" />
                  <InfoRow label="Investor Tier" value={result.investors?.tier} highlight={result.investors?.tier?.includes("1") ? "#4ade80" : "#94a3b8"} />
                  <InfoRow label="Total Raised" value={result.investors?.totalRaised} />
                  <InfoRow label="Last Round" value={result.investors?.lastRound} />
                  {result.investors?.notableVCs?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>NOTABLE VCs</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {result.investors.notableVCs.map((v, i) => <ExchangeBadge key={i} name={v} />)}
                      </div>
                    </div>
                  )}
                </Card>

                <Card>
                  <SectionTitle icon="💬" title="Community & Sentiment" />
                  <InfoRow label="Community" value={result.sentiment?.community} />
                  <InfoRow label="Dev Activity" value={result.sentiment?.developerActivity} />
                  <InfoRow label="Recent News" value={result.sentiment?.recentNews} />
                  <InfoRow label="GitHub Stars" value={result.marketData?.githubStars} />
                  <InfoRow label="Telegram" value={result.marketData?.telegramMembers} />
                </Card>

                <Card>
                  <SectionTitle icon="⚖️" title="Pros & Cons" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 10, color: "#4ade80", fontFamily: "'Space Mono', monospace", marginBottom: 10, letterSpacing: 1 }}>✓ PROS</p>
                      {result.prosAndCons?.pros?.map((p, i) => (
                        <div key={i} style={{ display: "flex", gap: 7, color: "#86efac", fontSize: 12, padding: "4px 0", lineHeight: 1.5 }}>
                          <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span><span>{p}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "#f87171", fontFamily: "'Space Mono', monospace", marginBottom: 10, letterSpacing: 1 }}>✗ CONS</p>
                      {result.prosAndCons?.cons?.map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: 7, color: "#fca5a5", fontSize: 12, padding: "4px 0", lineHeight: 1.5 }}>
                          <span style={{ color: "#f87171", flexShrink: 0 }}>✗</span><span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card style={{ background: "linear-gradient(135deg,#060e1c,#0c1929)", border: "1px solid #1e3a5f" }}>
                  <SectionTitle icon="📝" title="Investment Summary" />
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8, marginBottom: 14 }}>{result.investmentSummary}</p>
                  <div style={{ background: "#030811", borderRadius: 8, padding: 12, border: "1px solid #1a2640" }}>
                    <p style={{ color: "#334155", fontSize: 10, fontFamily: "'Space Mono', monospace", lineHeight: 1.7 }}>⚠️ {result.disclaimer}</p>
                  </div>
                </Card>
              </div>
            )}

            {/* ── TAB: TOKENOMICS ── */}
            {activeTab === "tokenomics" && (
              <div className="fade-up">
                <Card>
                  <SectionTitle icon="🪙" title="Token Supply & Distribution" />
                  <InfoRow label="Total Supply" value={result.tokenomics?.totalSupply} />
                  <InfoRow label="Circulating Supply" value={result.tokenomics?.circulatingSupply} />
                  <InfoRow label="Distribution" value={result.tokenomics?.distribution} />
                  <InfoRow label="Inflation Model" value={result.tokenomics?.inflationModel} />
                  <InfoRow label="Staking Yield" value={result.tokenomics?.stakingYield} highlight="#4ade80" />
                </Card>
                <Card style={{ border: "1px solid #78350f55" }}>
                  <SectionTitle icon="🔓" title="Vesting & Upcoming Unlocks" />
                  <div style={{ background: "#1c0e04", border: "1px solid #92400e44", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <p style={{ fontSize: 10, color: "#d97706", fontFamily: "'Space Mono', monospace", marginBottom: 6, letterSpacing: 1 }}>⚠️ UPCOMING UNLOCKS</p>
                    <p style={{ color: "#fbbf24", fontSize: 13, lineHeight: 1.6 }}>{result.tokenomics?.upcomingUnlocks}</p>
                  </div>
                  <InfoRow label="Vesting Schedule" value={result.tokenomics?.vestingSchedule} />
                </Card>
              </div>
            )}

            {/* ── TAB: TECHNICAL ── */}
            {activeTab === "technical" && (
              <div className="fade-up">
                <Card>
                  <SectionTitle icon="⚙️" title="Technical Specs" />
                  <InfoRow label="Consensus" value={result.consensus} />
                  <InfoRow label="TPS" value={result.technical?.tps} highlight="#38bdf8" />
                  <InfoRow label="Finality" value={result.technical?.finality} />
                  <InfoRow label="Security" value={result.technical?.security} />
                  <InfoRow label="Decentralization" value={result.technical?.decentralization} />
                  <InfoRow label="Audits" value={result.technical?.audits} />
                  <InfoRow label="TVL" value={result.technical?.tvl} highlight="#4ade80" />
                  <InfoRow label="Open Source" value={result.technical?.openSource ? "✅ Yes" : "❌ No"} />
                </Card>

                <Card>
                  <SectionTitle icon="📊" title="Technical Indicators" />
                  <p style={{ fontSize: 10, color: "#334155", fontFamily: "'Space Mono', monospace", marginBottom: 12, letterSpacing: 1 }}>
                    ⚠️ AI ESTIMATED — VERIFY ON TRADINGVIEW
                  </p>

                  {/* timeframe overview badges */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {[
                      ["4H", result.indicators?.["4h"]?.sentiment],
                      ["1D", result.indicators?.["1d"]?.sentiment],
                      ["1W", result.indicators?.["1w"]?.sentiment],
                      ["1M", result.indicators?.["1m"]?.sentiment],
                    ].map(([tf, s]) => <TFBadge key={tf} tf={tf} sentiment={s || "Neutral"} />)}
                  </div>

                  {/* detailed per timeframe */}
                  {[
                    ["4H", result.indicators?.["4h"]],
                    ["1D", result.indicators?.["1d"]],
                    ["1W", result.indicators?.["1w"]],
                    ["1M", result.indicators?.["1m"]],
                  ].map(([tf, ind]) => ind && (
                    <div key={tf} style={{
                      background: "#04090f", border: "1px solid #1a2640",
                      borderRadius: 10, padding: 12, marginBottom: 10
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#38bdf8" }}>{tf} TIMEFRAME</span>
                        <span style={{
                          fontSize: 10, padding: "2px 9px", borderRadius: 20,
                          fontFamily: "'Space Mono', monospace",
                          ...(() => { const s = getSentimentStyle(ind.sentiment); return { background: s.bg, color: s.color, border: 1px solid ${s.border} }; })()
                        }}>{ind.sentiment}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                        {[["RSI", ind.rsi], ["MACD", ind.macd], ["EMA", ind.ema]].map(([l, v]) => (
                          <div key={l} style={{ background: "#030811", borderRadius: 6, padding: "7px 10px" }}>
                            <div style={{ fontSize: 9, color: "#334155", fontFamily: "'Space Mono', monospace", marginBottom: 3 }}>{l}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>{ind.summary}</p>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {/* ── TAB: MARKET ── */}
            {activeTab === "market" && (
              <div className="fade-up">
                <Card>
                  <SectionTitle icon="📈" title="Market Data" />
                  <InfoRow label="30D Price Range" value={result.marketData?.priceRange30d} highlight="#38bdf8" />
                  <InfoRow label="30D Performance" value={result.marketData?.last30dChange}
                    highlight={result.marketData?.last30dChange?.includes("+") ? "#4ade80" : "#f87171"} />
                  <InfoRow label="Market Cap" value={result.marketData?.marketCapCategory} />
                  <InfoRow label="24H Volume" value={result.marketData?.volume24h} />
                  <InfoRow label="All Time High" value={result.marketData?.allTimeHigh} />
                </Card>

                <Card>
                  <SectionTitle icon="🏛️" title="Exchange Listings" />
                  <p style={{ fontSize: 11, color: "#334155", fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>AVAILABLE ON</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.marketData?.exchanges?.map((ex, i) => (
                      <div key={i} style={{
                        background: "#080f1e", border: "1px solid #1e3a5f",
                        borderRadius: 8, padding: "8px 14px",
                        display: "flex", alignItems: "center", gap: 6
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
                        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Space Mono', monospace" }}>{ex}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <SectionTitle icon="🐦" title="Social Media" />
                  {[
                    ["Twitter Followers", result.marketData?.twitterFollowers, "#1da1f2"],
                    ["Telegram Members", result.marketData?.telegramMembers, "#2aabee"],
                    ["GitHub Stars", result.marketData?.githubStars, "#f0f6fc"],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0", borderBottom: "1px solid #0f172a"
                    }}>
                      <span style={{ fontSize: 12, color: "#475569" }}>{l}</span>
                      <span style={{ fontSize: 14, color: c, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{v || "N/A"}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {/* ── TAB: RELIGIOUS ── */}
            {activeTab === "religious" && (
              <div className="fade-up">
                <p style={{ fontSize: 11, color: "#334155", fontFamily: "'Space Mono', monospace", marginBottom: 14, letterSpacing: 1, textAlign: "center" }}>
                  ⚠️ FOR EDUCATIONAL PURPOSES ONLY — CONSULT A QUALIFIED SCHOLAR
                </p>

                {[
                  { key: "islam", flag: "☪️", name: "ISLAM", subtitle: "Shariah Compliance Analysis" },
                  { key: "christianity", flag: "✝️", name: "CHRISTIANITY", subtitle: "Biblical Finance Principles" },
                  { key: "hinduism", flag: "🕉️", name: "HINDUISM", subtitle: "Dharmic Investing Perspective" },
                ].map(({ key, flag, name, subtitle }) => {
                  const data = result.religious?.[key];
                  if (!data) return null;
                  const vs = getVerdictStyle(data.verdict);
                  return (
                    <Card key={key} style={{ border: 1px solid ${vs.border}33 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 20 }}>{flag}</span>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#94a3b8", letterSpacing: 2 }}>{name}</span>
                          </div>
                          <p style={{ fontSize: 11, color: "#334155" }}>{subtitle}</p>
                        </div>
                        <div style={{
                          background: vs.bg, border: 1px solid ${vs.border},
                          borderRadius: 8, padding: "6px 12px", textAlign: "center"
                        }}>
                          <div style={{ fontSize: 16 }}>{vs.icon}</div>
                          <div style={{ fontSize: 11, color: vs.color, fontWeight: 700, fontFamily: "'Space Mono', monospace", marginTop: 2 }}>{data.verdict}</div>
                        </div>
                      </div>

                      <div style={{ background: vs.bg, border: 1px solid ${vs.border}33, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <p style={{ fontSize: 13, color: vs.color, fontWeight: 600, marginBottom: 4 }}>{data.shortReason}</p>
                      </div>

                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, marginBottom: 10 }}>{data.details}</div>

                      {data.scholarView && (
                        <div style={{ background: "#080f1e", borderRadius: 8, padding: 10, marginBottom: 10, border: "1px solid #1a2640" }}>
                          <p style={{ fontSize: 10, color: "#38bdf8", fontFamily: "'Space Mono', monospace", marginBottom: 4, letterSpacing: 1 }}>SCHOLAR / AUTHORITY VIEW</p>
                          <p style={{ fontSize: 12, color: "#64748b" }}>{data.scholarView}</p>
                        </div>
                      )}

                      <div style={{ background: "#080f1e", borderRadius: 8, padding: 10, border: "1px solid #1a2640" }}>
                        <p style={{ fontSize: 10, color: "#a78bfa", fontFamily: "'Space Mono', monospace", marginBottom: 4, letterSpacing: 1 }}>CONDITIONS / GUIDANCE</p>
                        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{data.conditions}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* reset */}
            <button className="btn-primary" style={{ width: "100%", marginTop: 8, padding: 15, fontSize: 13 }}
              onClick={() => { setResult(null); setQuery(""); }}>
              ← ANALYZE ANOTHER PROJECT
            </button>
          </div>
        )}

        {!result && !loading && (
          <p style={{ textAlign: "center", color: "#0f172a", fontSize: 10, fontFamily: "'Space Mono', monospace", marginTop: 32, letterSpacing: 1 }}>
            ASAN CRYPTO · AI-POWERED · NOT FINANCIAL ADVICE · DYOR
          </p>
        )}
      </div>
    </div>
  );
}
