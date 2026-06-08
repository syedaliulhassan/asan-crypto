import { NextResponse } from 'next/server';

export async function POST(request) {
  const { project } = await request.json();

  const prompt = You are a professional crypto research analyst. Analyze the cryptocurrency project: "${project}". Return ONLY valid JSON (no markdown, no backticks) with this exact structure: {"name":"Full project name","symbol":"TICKER","tagline":"One sentence description","category":"Layer1/Layer2/DeFi/NFT/GameFi/Oracle/etc","riskLevel":"Low/Medium/High/Very High","overallScore":7,"founded":"Year","blockchain":"Own chain or Ethereum etc","consensus":"PoS/PoW/etc","marketData":{"priceRange30d":"approx range","marketCapCategory":"Large/Mid/Small Cap","volume24h":"approx volume","allTimeHigh":"approx ATH","exchanges":["Binance","Coinbase","OKX","Bybit","Kraken"],"twitterFollowers":"e.g. 3.2M","telegramMembers":"e.g. 450K or N/A","githubStars":"e.g. 12K or N/A","last30dChange":"e.g. +12% or -8%"},"fundamentals":{"score":8,"team":"Team description","useCase":"Problem it solves","technology":"Core tech","adoption":"Partnerships and usage","competition":"Main competitors","roadmap":"Roadmap status"},"tokenomics":{"score":7,"totalSupply":"Total supply","circulatingSupply":"Circulating","distribution":"Distribution breakdown","vestingSchedule":"Vesting details","upcomingUnlocks":"Next unlock events","inflationModel":"Inflationary/Deflationary/Fixed","stakingYield":"APY or N/A"},"investors":{"score":8,"tier":"Tier 1/2/Unknown","notableVCs":["VC1","VC2","VC3"],"totalRaised":"Total funding","lastRound":"Latest round"},"technical":{"score":7,"tps":"TPS number","finality":"Finality time","security":"Security model","decentralization":"Decentralization level","openSource":true,"audits":"Audit status","tvl":"TVL or N/A"},"indicators":{"4h":{"rsi":"58","macd":"Bullish","ema":"Above 200 EMA","sentiment":"Bullish","summary":"Short summary"},"1d":{"rsi":"52","macd":"Neutral","ema":"Above 200 EMA","sentiment":"Neutral","summary":"Short summary"},"1w":{"rsi":"61","macd":"Bullish","ema":"Above 200 EMA","sentiment":"Bullish","summary":"Short summary"},"1m":{"rsi":"55","macd":"Neutral","ema":"Below 200 EMA","sentiment":"Neutral","summary":"Short summary"}},"sentiment":{"score":6,"community":"Community description","developerActivity":"Activity level","recentNews":"Latest news"},"religious":{"islam":{"verdict":"Halal/Haram/Controversial","shortReason":"One line","details":"Detailed Islamic analysis","scholarView":"Scholar opinions","conditions":"Permissibility conditions"},"christianity":{"verdict":"Permitted/Cautioned/Prohibited","shortReason":"One line","details":"Biblical principles analysis","conditions":"Christian investor guidance"},"hinduism":{"verdict":"Acceptable/Cautioned/Avoid","shortReason":"One line","details":"Dharmic principles analysis","conditions":"Hindu investor guidance"}},"prosAndCons":{"pros":["Pro 1","Pro 2","Pro 3","Pro 4"],"cons":["Con 1","Con 2","Con 3"]},"investmentSummary":"3-4 sentence investment thesis","disclaimer":"Educational purposes only. Not financial or religious advice. Always DYOR."};

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(i => i.text || '').join('');
    const clean = text.replace(/json|/g, '').trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message },
      { status: 500 }
    );
  }
}
