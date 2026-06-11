import { NextResponse } from 'next/server';

async function getCoinGeckoData(projectName) {
  try {
    const searchRes = await fetch(
      'https://api.coingecko.com/api/v3/search?query=' + projectName,
      { headers: { 'Accept': 'application/json' } }
    );
    const searchData = await searchRes.json();
    if (!searchData.coins || searchData.coins.length === 0) return null;
    const coinId = searchData.coins[0].id;
    const dataRes = await fetch(
      'https://api.coingecko.com/api/v3/coins/' + coinId + '?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true',
      { headers: { 'Accept': 'application/json' } }
    );
    const coin = await dataRes.json();
    return {
      currentPrice: coin.market_data ? '$' + coin.market_data.current_price.usd : 'N/A',
      priceChange30d: coin.market_data ? (coin.market_data.price_change_percentage_30d ? coin.market_data.price_change_percentage_30d.toFixed(2) + '%' : 'N/A') : 'N/A',
      marketCap: coin.market_data ? '$' + (coin.market_data.market_cap.usd / 1e9).toFixed(2) + 'B' : 'N/A',
      volume24h: coin.market_data ? '$' + (coin.market_data.total_volume.usd / 1e6).toFixed(2) + 'M' : 'N/A',
      ath: coin.market_data ? '$' + coin.market_data.ath.usd : 'N/A',
      circulatingSupply: coin.market_data ? coin.market_data.circulating_supply.toLocaleString() : 'N/A',
      totalSupply: coin.market_data && coin.market_data.total_supply ? coin.market_data.total_supply.toLocaleString() : 'N/A',
      twitterFollowers: coin.community_data ? coin.community_data.twitter_followers.toLocaleString() : 'N/A',
      exchanges: coin.tickers ? [...new Set(coin.tickers.slice(0, 10).map(t => t.market.name))].slice(0, 6) : [],
      high24h: coin.market_data ? '$' + coin.market_data.high_24h.usd : 'N/A',
      low24h: coin.market_data ? '$' + coin.market_data.low_24h.usd : 'N/A',
    };
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  const { project } = await request.json();
  const cgData = await getCoinGeckoData(project);

  const marketContext = cgData ?
    "Real market data: Current Price: " + cgData.currentPrice +
    ", 30d Change: " + cgData.priceChange30d +
    ", Market Cap: " + cgData.marketCap +
    ", 24h Volume: " + cgData.volume24h +
    ", ATH: " + cgData.ath +
    ", Circulating Supply: " + cgData.circulatingSupply +
    ", Total Supply: " + cgData.totalSupply +
    ", Twitter Followers: " + cgData.twitterFollowers +
    ", Exchanges: " + cgData.exchanges.join(', ') :
    "No real-time data available, use your knowledge.";

  const prompt = "You are a professional crypto research analyst. Analyze the cryptocurrency project: " + project + ". " + marketContext + ". Use this real data in your response. Return ONLY valid JSON (no markdown, no backticks) with this exact structure: {\"name\":\"Full project name\",\"symbol\":\"TICKER\",\"tagline\":\"One sentence description\",\"category\":\"Layer1 or DeFi or NFT\",\"riskLevel\":\"Low or Medium or High or Very High\",\"overallScore\":7,\"founded\":\"Year\",\"blockchain\":\"chain name\",\"consensus\":\"PoS or PoW\",\"marketData\":{\"currentPrice\":\"exact price\",\"priceRange30d\":\"approx range\",\"marketCapCategory\":\"Large or Mid or Small Cap\",\"marketCap\":\"exact market cap\",\"volume24h\":\"exact volume\",\"allTimeHigh\":\"exact ATH\",\"high24h\":\"24h high\",\"low24h\":\"24h low\",\"exchanges\":[\"Binance\",\"Coinbase\",\"OKX\"],\"twitterFollowers\":\"exact followers\",\"telegramMembers\":\"estimate\",\"githubStars\":\"estimate\",\"last30dChange\":\"exact % change\"},\"fundamentals\":{\"score\":8,\"team\":\"description\",\"useCase\":\"problem solved\",\"technology\":\"core tech\",\"adoption\":\"partnerships\",\"competition\":\"competitors\",\"roadmap\":\"status\"},\"tokenomics\":{\"score\":7,\"totalSupply\":\"exact supply\",\"circulatingSupply\":\"exact circulating\",\"distribution\":\"breakdown\",\"vestingSchedule\":\"vesting\",\"upcomingUnlocks\":\"unlock events\",\"inflationModel\":\"model\",\"stakingYield\":\"APY\"},\"investors\":{\"score\":8,\"tier\":\"Tier 1\",\"notableVCs\":[\"VC1\",\"VC2\"],\"totalRaised\":\"funding\",\"lastRound\":\"round\"},\"technical\":{\"score\":7,\"tps\":\"TPS\",\"finality\":\"time\",\"security\":\"model\",\"decentralization\":\"level\",\"openSource\":true,\"audits\":\"status\",\"tvl\":\"TVL\"},\"indicators\":{\"4h\":{\"rsi\":\"58\",\"macd\":\"Bullish\",\"ema\":\"Above 200 EMA\",\"sentiment\":\"Bullish\",\"summary\":\"summary\"},\"1d\":{\"rsi\":\"52\",\"macd\":\"Neutral\",\"ema\":\"Above 200 EMA\",\"sentiment\":\"Neutral\",\"summary\":\"summary\"},\"1w\":{\"rsi\":\"61\",\"macd\":\"Bullish\",\"ema\":\"Above 200 EMA\",\"sentiment\":\"Bullish\",\"summary\":\"summary\"},\"1m\":{\"rsi\":\"55\",\"macd\":\"Neutral\",\"ema\":\"Below 200 EMA\",\"sentiment\":\"Neutral\",\"summary\":\"summary\"}},\"sentiment\":{\"score\":6,\"community\":\"description\",\"developerActivity\":\"level\",\"recentNews\":\"news\"},\"religious\":{\"islam\":{\"verdict\":\"Halal or Haram or Controversial\",\"shortReason\":\"one line\",\"details\":\"analysis\",\"scholarView\":\"opinions\",\"conditions\":\"conditions\"},\"christianity\":{\"verdict\":\"Permitted or Cautioned\",\"shortReason\":\"one line\",\"details\":\"analysis\",\"conditions\":\"guidance\"},\"hinduism\":{\"verdict\":\"Acceptable or Cautioned\",\"shortReason\":\"one line\",\"details\":\"analysis\",\"conditions\":\"guidance\"}},\"prosAndCons\":{\"pros\":[\"Pro 1\",\"Pro 2\",\"Pro 3\"],\"cons\":[\"Con 1\",\"Con 2\",\"Con 3\"]},\"investmentSummary\":\"thesis here\",\"disclaimer\":\"Educational only. Not financial advice.\"}";

  try {
    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.AIML_API_KEY
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: 'API Error', details: data.error.message }, { status: 500 });
    }

    const text = data.choices[0].message.content || '';
    const clean = text.replace(/json|/g, '').trim();
    const result = JSON.parse(clean);

    if (cgData && cgData.exchanges.length > 0) result.marketData.exchanges = cgData.exchanges;
    if (cgData && cgData.twitterFollowers) result.marketData.twitterFollowers = cgData.twitterFollowers;
    if (cgData && cgData.currentPrice) result.marketData.currentPrice = cgData.currentPrice;
    if (cgData && cgData.priceChange30d) result.marketData.last30dChange = cgData.priceChange30d;
    if (cgData && cgData.marketCap) result.marketData.marketCap = cgData.marketCap;
    if (cgData && cgData.volume24h) result.marketData.volume24h = cgData.volume24h;

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed', details: error.message }, { status: 500 });
  }
}
