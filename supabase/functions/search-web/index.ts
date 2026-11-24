const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { keywords, location, dateRange } = await req.json();

    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpApiKey) {
      throw new Error("SERPAPI_KEY not configured");
    }

    let dateFilter = "";
    if (dateRange === "24h") dateFilter = "&tbs=qdr:d";
    else if (dateRange === "7days") dateFilter = "&tbs=qdr:w";
    else if (dateRange === "30days") dateFilter = "&tbs=qdr:m";

    let locationParam = "";
    if (location && location !== "worldwide" && location !== "remote") {
      locationParam = `&location=${encodeURIComponent(location)}`;
    }

    const results: any[] = [];
    const seen = new Set();
    let successfulQueries = 0;

    for (const kw of keywords.slice(0, 3)) {
      const query = `"${kw}" looking for OR need OR hiring OR freelance OR web developer`;
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}${dateFilter}${locationParam}&api_key=${serpApiKey}&num=20`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const data = await resp.json();
        if (data.error) continue;
        successfulQueries++;
        const posts = data.organic_results || [];

        for (const r of posts) {
          if (!r.link || seen.has(r.link)) continue;
          const domain = (r.displayed_link || r.link).toLowerCase();
          if (domain.includes("wikipedia") || domain.includes("youtube")) continue;
          seen.add(r.link);

          let source = "web_search";
          if (domain.includes("upwork.com")) source = "upwork";
          else if (domain.includes("freelancer.com")) source = "freelancer";
          else if (domain.includes("reddit.com")) source = "reddit";
          else if (domain.includes("linkedin.com")) source = "linkedin";
          else if (domain.includes("indeed.com")) source = "indeed";

          results.push({
            source,
            externalId: `serp_${btoa(r.link).slice(0, 32)}`,
            title: r.title || null,
            content: r.snippet || r.title || "",
            authorName: r.displayed_link || null,
            postUrl: r.link,
            publishedAt: r.date || null,
            metadata: { domain: r.displayed_link || null },
          });
        }
      } catch {
        continue;
      }

      await new Promise(r => setTimeout(r, 300));
    }

    if (successfulQueries === 0) throw new Error("SerpAPI did not complete any searches");

    return new Response(
      JSON.stringify({ posts: results, total: results.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
