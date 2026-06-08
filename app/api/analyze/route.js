import { NextResponse } from 'next/server';

export async function POST(request) {
  const { project } = await request.json();

  const prompt = "You are a professional crypto research analyst. Analyze the cryptocurrency project: " + project + ". Return ONLY valid JSON (no markdown, no backticks) with this exact structure: {\"name\":\"Full project name\",\"symbol\":\"TICKER\",\"tagline\":\"One sentence description\",\"category\":\"Layer1 or DeFi or NFT\",\"riskLevel\":\"Low or Medium or High or Very High\",\"overallScore\":7,\"founded\":\"Year\",\"blockchain\":\"chain name\",\"consensus\":\"PoS or PoW\",\"marketData\":{\"priceRange30d\":\"approx range\",\"marketCapCategory\":\"Large or Mid or Small Cap\",\"volume24h\":\"approx volume\",\"allTimeHigh\":\"approx ATH\",\"exchanges\":[\"Binance\",\"Coinbase\",\"OKX\"],\"twitterFollowers\":\"3.2M\",\"telegramMembers\":\"450K\",\"githubStars\":\"12K\",\"last30dChange\":\"+12%\"},\"fundamentals\":{\"score\":8,\"team\":\"description\",\"useCase\":\"problem solved\",\"technology\":\"core tech\",\"adoption\":\"partnerships\",\"competition\":\"competitors\",\"roadmap\":\"status\"},\"tokenomics\":{\"score\":7,\"totalSupply\":\"supply\",\"circulatingSupply\":\"circulating\",\"distribution\":\"breakdown\",\"vestingSchedule\":\"vesting\",\"upcomingUnlocks\":\"unlock events\",\"inflationModel\":\"model\",\"stakingYield\":\"APY\"},\"investors\":{\"score\":8,\"tier\":\"Tier 1\",\"notableVCs\":[\"VC1\",\"VC2\"],\"totalRaised\":\"funding\",\"lastRound\":\"round\"},\"technical\":{\"score\":7,\"tps\":\"TPS\",\"finality\":\"time\",\"security\":\"model\",\"decentralization\":\"level\",\"openSource\":true,\"audits\":\"status\",\"tvl\":\"TVL\"},\"indicators\":{\"4h\":{\"rsi\":\"58\",\"macd\":\"Bullish\",\"ema\":\"Above 200 EMA\",\"sentiment\":\"Bullish\",\"summary\":\"summary\"},\"1d\":{\"rsi\":\"52\",\"macd\":\"Neutral\",\"ema\":\"Above 200 EMA\",\"sentiment\":\"Neutral\",\"summary\":\"summary\"},\"1w\":{\"rsi\":\"61\",\"macd\":\"Bullish\",\"ema\":\"Above 200 EMA\",\"sentiment\":\"Bullish\",\"summary\":\"summary\"},\"1m\":{\"rsi\":\"55\",\"macd\":\"Neutral\",\"ema\":\"Below 200 EMA\",\"sentiment\":\"Neutral\",\"summary\":\"summary\"}},\"sentiment\":{\"score\":6,\"community\":\"description\",\"developerActivity\":\"level\",\"recentNews\":\"news\"},\"religious\":{\"islam\":{\"verdict\":\"Halal or Haram or Controversial\",\"shortReason\":\"one line\",\"details\":\"analysis\",\"scholarView\":\"opinions\",\"conditions\":\"conditions\"},\"christianity\":{\"verdict\":\"Permitted or Cautioned\",\"shortReason\":\"one line\",\"details\":\"analysis\",\"conditions\":\"guidance\"},\"hinduism\":{\"verdict\":\"Acceptable or Cautioned\",\"shortReason\":\"one line\",\"details\":\"analysis\",\"conditions\":\"guidance\"}},\"prosAndCons\":{\"pros\":[\"Pro 1\",\"Pro 2\",\"Pro 3\"],\"cons\":[\"Con 1\",\"Con 2\",\"Con 3\"]},\"investmentSummary\":\"thesis here\",\"disclaimer\":\"Educational only. Not financial advice.\"}";

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: 'API Error', details: data.error.message }, { status: 500 });
    }

    if (!data.content || data.content.length === 0) {
      return NextResponse.json({ error: 'Empty response', details: JSON.stringify(data) }, { status: 500 });
    }

    const text = data.content[0].text || '';
    const clean = text.replace(/json|/g, '').trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed', details: error.message }, { status: 500 });
  }
}
