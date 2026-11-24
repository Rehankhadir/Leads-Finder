const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JOB_SITES = [
  "weworkremotely.com",
  "wellfound.com",
  "ycombinator.com",
  "remote.co",
  "flexjobs.com",
  "remotive.com",
  "workingnomads.com",
  "remoteok.com",
  "justremote.co",
  "skipthedrive.com",
  "remoterocketship.com",
  "careervault.io",
  "remotehub.com",
  "findasync.com",
  "remotefront.com",
  "topstartups.io",
  "linkedin.com",
  "indeed.com",
  "glassdoor.com",
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

    for (const kw of keywords.slice(0, 3)) {
      const siteChunks: string[][] = [];
      for (let i = 0; i < JOB_SITES.length; i += 5) {
        siteChunks.push(JOB_SITES.slice(i, i + 5));
      }

      for (const chunk of siteChunks) {
        const siteQuery = chunk.map(s => `site:${s}`).join(" OR ");
        const query = `(${siteQuery}) "${kw}" remote developer`;
        const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}${dateFilter}&api_key=${serpApiKey}&num=20`;

        try {
          const resp = await fetch(url);
          if (!resp.ok) continue;
          const data = await resp.json();
          const posts = data.organic_results || [];

          for (const r of posts) {
            if (!r.link || seen.has(r.link)) continue;
            const domain = (r.displayed_link || r.link).toLowerCase();
            if (domain.includes("wikipedia") || domain.includes("youtube")) continue;
            seen.add(r.link);

            let source = "web_search";
            for (const site of JOB_SITES) {
              if (domain.includes(site)) {
                source = site.replace(/\./g, "").replace(/\/.*/, "");
                break;
              }
            }

            results.push({
              source,
              externalId: `job_${btoa(r.link).slice(0, 32)}`,
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
    }

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
