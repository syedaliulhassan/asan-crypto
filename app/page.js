"use client";
import { useState } from "react";

const QUICK_CRYPTOS = ["Bitcoin", "Ethereum", "Solana", "Chainlink", "NEAR", "Render", "Avalanche", "Polkadot"];

const getRiskColor = (r) => {
  if (!r) return "#94a3b8";
  const v = r.toLowerCase();
  if (v.includes("very high")) return "#ef4444";
  if (v.includes("high")) return "#f97316";
  if (v.includes("medium")) return "#f59e0b";
  if (v.includes("low")) return "#22c55e";
  return "#94a3b8";
};

const getVerdictStyle = (v) => {
  if (!v) return { bg: "#1c1506", border: "#d97706", color: "#fbbf24", icon: "⚠️" };
  const val = v.toLowerCase();
  if (val.includes("halal") || val.includes("permitted") || val.includes("acceptable"))
    return { bg: "#052e16", border: "#16a34a", color: "#4ade80", icon: "✅" };
  if (val.includes("haram") || val.includes("prohibited") || val.includes("avoid"))
    return { bg: "#2d0a0a", border: "#dc2626", color: "#f87171", icon: "❌" };
  return { bg: "#1c1506", border: "#d97706", color: "#fbbf24", icon: "⚠️" };
};

const getSentimentStyle = (s) => {
  if (!s) return { color: "#fbbf24", bg: "#1c1506", border: "#d97706", icon: "◆" };
  const val = s.toLowerCase();
  if (val.includes("bullish")) return { color: "#4ade80", bg: "#052e16", border: "#16a34a", icon: "▲" };
  if (val.includes("bearish")) return { color: "#f87171", bg: "#2d0a0a", border: "#dc2626", icon: "▼" };
  return { color: "#fbbf24", bg: "#1c1506", border: "#d97706", icon: "◆" };
};

function ScoreRing({ score, size, color }) {
  const s = size || 64;
  const c = color || "#38bdf8";
  const r = s / 2 - 4;
  const circ = r * 2 * Math.PI;
  const offset = circ * (1 - score / 10);
  return (
    <div style={{ position: "relative", width: s, height: s, flexShrink: 0 }}>
      <svg width={s} height={s} viewBox={"0 0 " + s + " " + s} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={c} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontFamily:"'Bebas Neue',cursive",fontSize:s*0.3,color:c,lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:s*0.14,color:"#475569" }}>/10</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
        <span style={{ fontSize:11,color:"#64748b" }}>{label}</span>
        <span style={{ fontSize:11,color:color,fontWeight:700 }}>{value}/10</span>
      </div>
      <div style={{ height:5,background:"#1e293b",borderRadius:3,overflow:"hidden" }}>
        <div style={{ height:"100%",width:(value*10)+"%",background:"linear-gradient(90deg,"+color+"66,"+color+")",borderRadius:3,transition:"width 1.2s ease" }} />
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 0",borderBottom:"1px solid #0f172a",gap:12 }}>
      <span style={{ fontSize:12,color:"#475569",minWidth:130,flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12,color:highlight||"#cbd5e1",textAlign:"right",lineHeight:1.5 }}>{value}</span>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:10,textTransform:"uppercase",letterSpacing:"2px",color:"#38bdf8",marginBottom:14,borderBottom:"1px solid #1e293b",paddingBottom:10 }}>
      <span>{icon}</span>{title}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background:"#080f1e",border:"1px solid #1a2640",borderRadius:14,padding:18,marginBottom:12,...(style||{}) }}>
      {children}
    </div>
  );
}

function TFBadge({ tf, sentiment }) {
  const s = getSentimentStyle(sentiment);
  return (
    <div style={{ background:s.bg,border:"1px solid "+s.border,borderRadius:10,padding:"10px 12px",textAlign:"center",flex:1 }}>
      <div style={{ fontSize:10,color:"#475569",marginBottom:4 }}>{tf}</div>
      <div style={{ fontSize:16 }}>{s.icon}</div>
      <div style={{ fontSize:11,color:s.color,fontWeight:700,marginTop:3 }}>{sentiment}</div>
    </div>
  );
}

function LoadingPulse() {
  return (
    <div style={{ textAlign:"center",padding:"56px 20px" }}>
      <div style={{ display:"flex",justifyContent:"center",gap:6,marginBottom:20 }}>
        {[0,1,2,3,4].map(function(i) {
          return (
            <div key={i} style={{ width:4,borderRadius:4,background:"#38bdf8",height:32,opacity: 0.3 + i * 0.15 }} />
          );
        })}
      </div>
      <p style={{ color:"#334155",fontSize:12,letterSpacing:1 }}>ANALYZING PROJECT DATA...</p>
    </div>
  );
}

export default function AsanCrypto() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = [
    { id:"overview", label:"Overview" },
    { id:"tokenomics", label:"Tokenomics" },
    { id:"technical", label:"Technical" },
    { id:"market", label:"Market" },
    { id:"religious", label:"Religion" },
  ];

  function analyze(name) {
    const project = name || query.trim();
    if (!project) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveTab("overview");
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: project })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) { setResult(data); })
      .catch(function() { setError("Analysis failed. Please try again."); })
      .finally(function() { setLoading(false); });
  }

  return (
    <div style={{ minHeight:"100vh",background:"#030811",color:"#e2e8f0",fontFamily:"sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .inp{background:#080f1e;border:1.5px solid #1a2640;color:#e2e8f0;border-radius:12px;padding:13px 16px;font-size:15px;width:100%;outline:none;transition:border-color .2s}
        .inp:focus{border-color:#38bdf8}
        .inp::placeholder{color:#334155}
        .btn{background:linear-gradient(135deg,#0284c7,#38bdf8);color:#020c1a;border:none;border-radius:12px;padding:13px 24px;font-weight:700;font-size:14px;cursor:pointer;transition:opacity .2s;white-space:nowrap}
        .btn:hover{opacity:.9}
        .btn:disabled{opacity:.4;cursor:not-allowed}
        .chip{background:#080f1e;border:1px solid #1a2640;color:#64748b;border-radius:20px;padding:5px 13px;font-size:11px;cursor:pointer;transition:all .2s}
        .chip:hover{background:#1e3a5f;color:#38bdf8;border-color:#38bdf8}
        .tab{background:transparent;border:none;padding:9px 14px;font-size:12px;cursor:pointer;color:#334155;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
        .tab.active{color:#38bdf8;border-bottom-color:#38bdf8}
      `}</style>

      <div style={{ maxWidth:700,margin:"0 auto",padding:"24px 16px 80px" }}>

        {/* HEADER */}
        <div style={{ textAlign:"center",padding:"24px 0 28px" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"#0c1929",border:"1px solid #1e3a5f",borderRadius:8,padding:"5px 14px",marginBottom:14 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#38bdf8",display:"inline-block" }} />
            <span style={{ fontSize:10,color:"#38bdf8",letterSpacing:2 }}>AI-POWERED RESEARCH</span>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:"clamp(48px,12vw,80px)",letterSpacing:4,lineHeight:1,marginBottom:8,background:"linear-gradient(135deg,#f1f5f9 20%,#38bdf8 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
            ASAN CRYPTO
          </h1>
          <p style={{ color:"#334155",fontSize:13,fontWeight:300 }}>Complete crypto research — fundamentals, technicals, halal status and more</p>
        </div>

        {/* SEARCH */}
        <Card style={{ border:"1px solid #1e3a5f" }}>
          <div style={{ display:"flex",gap:10,marginBottom:14 }}>
            <input className="inp" value={query} onChange={function(e){setQuery(e.target.value)}}
              placeholder="Enter any crypto project (e.g. Solana, Chainlink...)"
              onKeyDown={function(e){if(e.key==="Enter") analyze();}} />
            <button className="btn" onClick={function(){analyze()}} disabled={loading||!query.trim()}>
              {loading ? "..." : "ANALYZE"}
            </button>
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:7,alignItems:"center" }}>
            <span style={{ fontSize:10,color:"#1e3a5f" }}>QUICK:</span>
            {QUICK_CRYPTOS.map(function(c) {
              return (
                <button key={c} className="chip" onClick={function(){setQuery(c);analyze(c);}}>
                  {c}
                </button>
              );
            })}
          </div>
        </Card>

        {loading && <Card><LoadingPulse /></Card>}
        {error && <Card style={{ borderColor:"#ef444433" }}><p style={{ color:"#ef4444",textAlign:"center",fontSize:13 }}>{error}</p></Card>}

        {result && !loading && (
          <div>
            {/* HERO */}
            <Card style={{ background:"linear-gradient(135deg,#060e1c,#0c1929)",border:"1px solid #1e3a5f" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap" }}>
                <div style={{ flex:1,minWidth:200 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap" }}>
                    <h2 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:36,letterSpacing:2,color:"#f1f5f9" }}>{result.name}</h2>
                    <span style={{ fontSize:12,color:"#38bdf8",background:"#0c2a45",border:"1px solid #1e4d7a",borderRadius:6,padding:"2px 9px" }}>${result.symbol}</span>
                  </div>
                  <p style={{ color:"#64748b",fontSize:13,marginBottom:12,lineHeight:1.6 }}>{result.tagline}</p>
                  <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                    <span style={{ background:"#0c2a45",border:"1px solid #1e4d7a",color:"#38bdf8",borderRadius:20,padding:"3px 11px",fontSize:11 }}>{result.category}</span>
                    <span style={{ background:getRiskColor(result.riskLevel)+"18",border:"1px solid "+getRiskColor(result.riskLevel)+"44",color:getRiskColor(result.riskLevel),borderRadius:20,padding:"3px 11px",fontSize:11 }}>{result.riskLevel} Risk</span>
                  </div>
                </div>
                <ScoreRing score={result.overallScore} size={76} color="#38bdf8" />
              </div>
              {result.marketData && (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:8,marginTop:16,paddingTop:16,borderTop:"1px solid #1a2640" }}>
                  {[
                    { label:"30D Range", val:result.marketData.priceRange30d, h:null },
                    { label:"30D Change", val:result.marketData.last30dChange, h:(result.marketData.last30dChange||"").includes("+")?"#4ade80":"#f87171" },
                    { label:"Market Cap", val:result.marketData.marketCapCategory, h:null },
                    { label:"Twitter", val:"🐦 "+result.marketData.twitterFollowers, h:null },
                  ].map(function(item) {
                    return (
                      <div key={item.label} style={{ background:"#04090f",borderRadius:8,padding:"9px 10px",border:"1px solid #1a2640" }}>
                        <div style={{ fontSize:10,color:"#334155",marginBottom:3 }}>{item.label}</div>
                        <div style={{ fontSize:12,color:item.h||"#94a3b8",fontWeight:600 }}>{item.val}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* SCORE BARS */}
            <Card>
              <SectionTitle icon="◆" title="Score Breakdown" />
              <ScoreBar label="Fundamentals" value={result.fundamentals ? result.fundamentals.score : 0} color="#38bdf8" />
              <ScoreBar label="Tokenomics" value={result.tokenomics ? result.tokenomics.score : 0} color="#a78bfa" />
              <ScoreBar label="Investors" value={result.investors ? result.investors.score : 0} color="#34d399" />
              <ScoreBar label="Technical" value={result.technical ? result.technical.score : 0} color="#fb923c" />
              <ScoreBar label="Sentiment" value={result.sentiment ? result.sentiment.score : 0} color="#f472b6" />
            </Card>

            {/* TABS */}
            <div style={{ display:"flex",overflowX:"auto",borderBottom:"1px solid #1a2640",marginBottom:12,gap:2 }}>
              {TABS.map(function(t) {
                return (
                  <button key={t.id} className={"tab"+(activeTab===t.id?" active":"")} onClick={function(){setActiveTab(t.id)}}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div>
                <Card>
                  <SectionTitle icon="🏗️" title="Fundamentals" />
                  {result.fundamentals && [
                    ["Use Case", result.fundamentals.useCase],
                    ["Technology", result.fundamentals.technology],
                    ["Team", result.fundamentals.team],
                    ["Adoption", result.fundamentals.adoption],
                    ["Competition", result.fundamentals.competition],
                    ["Roadmap", result.fundamentals.roadmap],
                  ].map(function(row) {
                    return row[1] ? <InfoRow key={row[0]} label={row[0]} value={row[1]} /> : null;
                  })}
                </Card>
                <Card>
                  <SectionTitle icon="🏦" title="Investors and Funding" />
                  <InfoRow label="Investor Tier" value={result.investors ? result.investors.tier : ""} highlight={(result.investors && result.investors.tier && result.investors.tier.includes("1")) ? "#4ade80" : "#94a3b8"} />
                  <InfoRow label="Total Raised" value={result.investors ? result.investors.totalRaised : ""} />
                  <InfoRow label="Last Round" value={result.investors ? result.investors.lastRound : ""} />
                  {result.investors && result.investors.notableVCs && result.investors.notableVCs.length > 0 && (
                    <div style={{ marginTop:12 }}>
                      <p style={{ fontSize:10,color:"#334155",marginBottom:8,letterSpacing:1 }}>NOTABLE VCs</p>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                        {result.investors.notableVCs.map(function(v,i) {
                          return <span key={i} style={{ background:"#0f1f35",border:"1px solid #1e3a5f",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#94a3b8" }}>{v}</span>;
                        })}
                      </div>
                    </div>
                  )}
                </Card>
                <Card>
                  <SectionTitle icon="💬" title="Community and Sentiment" />
                  {result.sentiment && <InfoRow label="Community" value={result.sentiment.community} />}
                  {result.sentiment && <InfoRow label="Dev Activity" value={result.sentiment.developerActivity} />}
                  {result.sentiment && <InfoRow label="Recent News" value={result.sentiment.recentNews} />}
                  {result.marketData && <InfoRow label="GitHub Stars" value={result.marketData.githubStars} />}
                  {result.marketData && <InfoRow label="Telegram" value={result.marketData.telegramMembers} />}
                </Card>
                <Card>
                  <SectionTitle icon="⚖️" title="Pros and Cons" />
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                    <div>
                      <p style={{ fontSize:10,color:"#4ade80",marginBottom:10,letterSpacing:1 }}>PROS</p>
                      {result.prosAndCons && result.prosAndCons.pros && result.prosAndCons.pros.map(function(p,i) {
                        return <div key={i} style={{ display:"flex",gap:7,color:"#86efac",fontSize:12,padding:"4px 0",lineHeight:1.5 }}><span style={{ color:"#4ade80",flexShrink:0 }}>✓</span><span>{p}</span></div>;
                      })}
                    </div>
                    <div>
                      <p style={{ fontSize:10,color:"#f87171",marginBottom:10,letterSpacing:1 }}>CONS</p>
                      {result.prosAndCons && result.prosAndCons.cons && result.prosAndCons.cons.map(function(c,i) {
                        return <div key={i} style={{ display:"flex",gap:7,color:"#fca5a5",fontSize:12,padding:"4px 0",lineHeight:1.5 }}><span style={{ color:"#f87171",flexShrink:0 }}>✗</span><span>{c}</span></div>;
                      })}
                    </div>
                  </div>
                </Card>
                <Card style={{ background:"linear-gradient(135deg,#060e1c,#0c1929)",border:"1px solid #1e3a5f" }}>
                  <SectionTitle icon="📝" title="Investment Summary" />
                  <p style={{ color:"#94a3b8",fontSize:13,lineHeight:1.8,marginBottom:14 }}>{result.investmentSummary}</p>
                  <div style={{ background:"#030811",borderRadius:8,padding:12,border:"1px solid #1a2640" }}>
                    <p style={{ color:"#334155",fontSize:10,lineHeight:1.7 }}>⚠️ {result.disclaimer}</p>
                  </div>
                </Card>
              </div>
            )}

            {/* TOKENOMICS TAB */}
            {activeTab === "tokenomics" && (
              <div>
                <Card>
                  <SectionTitle icon="🪙" title="Token Supply and Distribution" />
                  {result.tokenomics && [
                    ["Total Supply", result.tokenomics.totalSupply, null],
                    ["Circulating Supply", result.tokenomics.circulatingSupply, null],
                    ["Distribution", result.tokenomics.distribution, null],
                    ["Inflation Model", result.tokenomics.inflationModel, null],
                    ["Staking Yield", result.tokenomics.stakingYield, "#4ade80"],
                  ].map(function(row) {
                    return <InfoRow key={row[0]} label={row[0]} value={row[1]} highlight={row[2]} />;
                  })}
                </Card>
                <Card style={{ border:"1px solid #78350f55" }}>
                  <SectionTitle icon="🔓" title="Vesting and Upcoming Unlocks" />
                  <div style={{ background:"#1c0e04",border:"1px solid #92400e44",borderRadius:10,padding:14,marginBottom:12 }}>
                    <p style={{ fontSize:10,color:"#d97706",marginBottom:6,letterSpacing:1 }}>UPCOMING UNLOCKS</p>
                    <p style={{ color:"#fbbf24",fontSize:13,lineHeight:1.6 }}>{result.tokenomics ? result.tokenomics.upcomingUnlocks : ""}</p>
                  </div>
                  <InfoRow label="Vesting Schedule" value={result.tokenomics ? result.tokenomics.vestingSchedule : ""} />
                </Card>
              </div>
            )}

            {/* TECHNICAL TAB */}
            {activeTab === "technical" && (
              <div>
                <Card>
                  <SectionTitle icon="⚙️" title="Technical Specs" />
                  {result.technical && [
                    ["Consensus", result.consensus, null],
                    ["TPS", result.technical.tps, "#38bdf8"],
                    ["Finality", result.technical.finality, null],
                    ["Security", result.technical.security, null],
                    ["Decentralization", result.technical.decentralization, null],
                    ["Audits", result.technical.audits, null],
                    ["TVL", result.technical.tvl, "#4ade80"],
                    ["Open Source", result.technical.openSource ? "Yes" : "No", null],
                  ].map(function(row) {
                    return <InfoRow key={row[0]} label={row[0]} value={row[1]} highlight={row[2]} />;
                  })}
                </Card>
                <Card>
                  <SectionTitle icon="📊" title="Technical Indicators" />
                  <p style={{ fontSize:10,color:"#334155",marginBottom:12,letterSpacing:1 }}>AI ESTIMATED — VERIFY ON TRADINGVIEW</p>
                  {result.indicators && (
                    <div>
                      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
                        {[
                          ["4H", result.indicators["4h"] ? result.indicators["4h"].sentiment : "Neutral"],
                          ["1D", result.indicators["1d"] ? result.indicators["1d"].sentiment : "Neutral"],
                          ["1W", result.indicators["1w"] ? result.indicators["1w"].sentiment : "Neutral"],
                          ["1M", result.indicators["1m"] ? result.indicators["1m"].sentiment : "Neutral"],
                        ].map(function(item) {
                          return <TFBadge key={item[0]} tf={item[0]} sentiment={item[1]} />;
                        })}
                      </div>
                      {[
                        ["4H", result.indicators["4h"]],
                        ["1D", result.indicators["1d"]],
                        ["1W", result.indicators["1w"]],
                        ["1M", result.indicators["1m"]],
                      ].map(function(item) {
                        const tf = item[0];
                        const ind = item[1];
                        if (!ind) return null;
                        const s = getSentimentStyle(ind.sentiment);
                        return (
                          <div key={tf} style={{ background:"#04090f",border:"1px solid #1a2640",borderRadius:10,padding:12,marginBottom:10 }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                              <span style={{ fontSize:11,color:"#38bdf8" }}>{tf} TIMEFRAME</span>
                              <span style={{ fontSize:10,padding:"2px 9px",borderRadius:20,background:s.bg,color:s.color,border:"1px solid "+s.border }}>{ind.sentiment}</span>
                            </div>
                            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8 }}>
                              {[["RSI",ind.rsi],["MACD",ind.macd],["EMA",ind.ema]].map(function(r) {
                                return (
                                  <div key={r[0]} style={{ background:"#030811",borderRadius:6,padding:"7px 10px" }}>
                                    <div style={{ fontSize:9,color:"#334155",marginBottom:3 }}>{r[0]}</div>
                                    <div style={{ fontSize:11,color:"#94a3b8" }}>{r[1]}</div>
                                  </div>
                                );
                              })}
                            </div>
                            <p style={{ fontSize:11,color:"#475569",lineHeight:1.5 }}>{ind.summary}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* MARKET TAB */}
            {activeTab === "market" && (
              <div>
                <Card>
                  <SectionTitle icon="📈" title="Market Data" />
                  {result.marketData && [
                    ["30D Price Range", result.marketData.priceRange30d, "#38bdf8"],
                    ["30D Performance", result.marketData.last30dChange, (result.marketData.last30dChange||"").includes("+")?"#4ade80":"#f87171"],
                    ["Market Cap", result.marketData.marketCapCategory, null],
                    ["24H Volume", result.marketData.volume24h, null],
                    ["All Time High", result.marketData.allTimeHigh, null],
                  ].map(function(row) {
                    return <InfoRow key={row[0]} label={row[0]} value={row[1]} highlight={row[2]} />;
                  })}
                </Card>
                <Card>
                  <SectionTitle icon="🏛️" title="Exchange Listings" />
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                    {result.marketData && result.marketData.exchanges && result.marketData.exchanges.map(function(ex,i) {
                      return (
                        <div key={i} style={{ background:"#080f1e",border:"1px solid #1e3a5f",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:6 }}>
                          <div style={{ width:6,height:6,borderRadius:"50%",background:"#38bdf8" }} />
                          <span style={{ fontSize:12,color:"#94a3b8" }}>{ex}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card>
                  <SectionTitle icon="🐦" title="Social Media" />
                  {result.marketData && [
                    ["Twitter Followers", result.marketData.twitterFollowers, "#1da1f2"],
                    ["Telegram Members", result.marketData.telegramMembers, "#2aabee"],
                    ["GitHub Stars", result.marketData.githubStars, "#f0f6fc"],
                  ].map(function(row) {
                    return (
                      <div key={row[0]} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #0f172a" }}>
                        <span style={{ fontSize:12,color:"#475569" }}>{row[0]}</span>
                        <span style={{ fontSize:14,color:row[2],fontWeight:700 }}>{row[1]||"N/A"}</span>
                      </div>
                    );
                  })}
                </Card>
              </div>
            )}

            {/* RELIGIOUS TAB */}
            {activeTab === "religious" && (
              <div>
                <p style={{ fontSize:11,color:"#334155",marginBottom:14,letterSpacing:1,textAlign:"center" }}>
                  FOR EDUCATIONAL PURPOSES ONLY — CONSULT A QUALIFIED SCHOLAR
                </p>
                {[
                  { key:"islam", flag:"☪️", name:"ISLAM", subtitle:"Shariah Compliance Analysis" },
                  { key:"christianity", flag:"✝️", name:"CHRISTIANITY", subtitle:"Biblical Finance Principles" },
                  { key:"hinduism", flag:"🕉️", name:"HINDUISM", subtitle:"Dharmic Investing Perspective" },
                ].map(function(item) {
                  const data = result.religious ? result.religious[item.key] : null;
                  if (!data) return null;
                  const vs = getVerdictStyle(data.verdict);
                  return (
                    <Card key={item.key} style={{ border:"1px solid "+vs.border+"33" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                        <div>
                          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                            <span style={{ fontSize:20 }}>{item.flag}</span>
                            <span style={{ fontSize:12,color:"#94a3b8",letterSpacing:2 }}>{item.name}</span>
                          </div>
                          <p style={{ fontSize:11,color:"#334155" }}>{item.subtitle}</p>
                        </div>
                        <div style={{ background:vs.bg,border:"1px solid "+vs.border,borderRadius:8,padding:"6px 12px",textAlign:"center" }}>
                          <div style={{ fontSize:16 }}>{vs.icon}</div>
                          <div style={{ fontSize:11,color:vs.color,fontWeight:700,marginTop:2 }}>{data.verdict}</div>
                        </div>
                      </div>
                      <div style={{ background:vs.bg,border:"1px solid "+vs.border+"33",borderRadius:8,padding:12,marginBottom:12 }}>
                        <p style={{ fontSize:13,color:vs.color,fontWeight:600 }}>{data.shortReason}</p>
                      </div>
                      <div style={{ fontSize:12,color:"#64748b",lineHeight:1.7,marginBottom:10 }}>{data.details}</div>
                      {data.scholarView && (
                        <div style={{ background:"#080f1e",borderRadius:8,padding:10,marginBottom:10,border:"1px solid #1a2640" }}>
                          <p style={{ fontSize:10,color:"#38bdf8",marginBottom:4,letterSpacing:1 }}>SCHOLAR VIEW</p>
                          <p style={{ fontSize:12,color:"#64748b" }}>{data.scholarView}</p>
                        </div>
                      )}
                      <div style={{ background:"#080f1e",borderRadius:8,padding:10,border:"1px solid #1a2640" }}>
                        <p style={{ fontSize:10,color:"#a78bfa",marginBottom:4,letterSpacing:1 }}>CONDITIONS</p>
                        <p style={{ fontSize:12,color:"#64748b",lineHeight:1.6 }}>{data.conditions}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <button className="btn" style={{ width:"100%",marginTop:8,padding:15,fontSize:13 }}
              onClick={function(){setResult(null);setQuery("");}}>
              ANALYZE ANOTHER PROJECT
            </button>
          </div>
        )}

        {!result && !loading && (
          <p style={{ textAlign:"center",color:"#0f172a",fontSize:10,marginTop:32,letterSpacing:1 }}>
            ASAN CRYPTO · AI-POWERED · NOT FINANCIAL ADVICE · DYOR
          </p>
        )}
      </div>
    </div>
  );
}
