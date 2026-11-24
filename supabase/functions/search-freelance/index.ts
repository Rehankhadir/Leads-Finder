const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREELANCE_SITES = [
  "upwork.com",
  "freelancer.com",
  "toptal.com",
  "gun.io",
  "arc.dev",
  "vuejobs.com",
  "reactjobs.io",
  "reddit.com",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { keywords, dateRange } = await req.json();

    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpApiKey) {
      throw new Error("SERPAPI_KEY not configured");
    }

    let dateFilter = "";
    if (dateRange === "24h") dateFilter = "&tbs=qdr:d";
    else if (dateRange === "7days") dateFilter = "&tbs=qdr:w";
    else if (dateRange === "30days") dateFilter = "&tbs=qdr:m";

    const results: any[] = [];
    const seen = new Set();
    let successfulQueries = 0;

    for (const kw of keywords.slice(0, 3)) {
      const siteQuery = FREELANCE_SITES.map(s => `site:${s}`).join(" OR ");
      const query = `(${siteQuery}) "${kw}" freelance OR hiring OR project`;
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}${dateFilter}&api_key=${serpApiKey}&num=20`;

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
          for (const site of FREELANCE_SITES) {
            if (domain.includes(site)) {
              source = site.replace(/\./g, "").replace(/\/.*/, "");
              break;
            }
          }

          results.push({
            source,
            externalId: `freelance_${btoa(r.link).slice(0, 32)}`,
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
