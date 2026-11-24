import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function scorePost(text: string, source?: string, mode?: string) {
  let score = 50;
  const reasons: string[] = [];

  if (mode === "jobs") {
    if (source === "remoteok") { score += 20; reasons.push("RemoteOK listing"); }
    else if (source === "weworkremotely") { score += 20; reasons.push("WeWorkRemotely listing"); }
    else if (source === "remotive") { score += 18; reasons.push("Remotive listing"); }
    else if (source === "wellfound") { score += 15; reasons.push("Wellfound job"); }
    else if (source === "ycjobs") { score += 15; reasons.push("YC job"); }
    else if (source === "flexjobs") { score += 15; reasons.push("FlexJobs listing"); }
    else if (source === "linkedin") { score += 15; reasons.push("LinkedIn job"); }
    else if (source === "indeed") { score += 15; reasons.push("Indeed listing"); }
    else if (source === "remote.co") { score += 12; reasons.push("Remote.co listing"); }
    else if (source === "workingnomads") { score += 12; reasons.push("WorkingNomads listing"); }
    else if (source === "justremote") { score += 12; reasons.push("JustRemote listing"); }
    else if (source === "remoterocketship") { score += 12; reasons.push("RemoteRocketship listing"); }
    else if (source === "careervault") { score += 10; reasons.push("CareerVault listing"); }
    else if (source === "remotehub") { score += 10; reasons.push("RemoteHub listing"); }
    else if (source === "findasync") { score += 10; reasons.push("FindAsync listing"); }
    else if (source === "remotefront") { score += 10; reasons.push("RemoteFront listing"); }
    else if (source === "topstartups") { score += 10; reasons.push("TopStartups listing"); }
    else if (source === "skipthedrive") { score += 10; reasons.push("SkipTheDrive listing"); }
    else if (source === "reddit") { score += 8; reasons.push("Reddit post"); }
  } else {
    if (source === "upwork") { score += 20; reasons.push("Upwork gig"); }
    else if (source === "freelancer") { score += 20; reasons.push("Freelancer project"); }
    else if (source === "toptal") { score += 18; reasons.push("Toptal project"); }
    else if (source === "gunio") { score += 15; reasons.push("Gun.io project"); }
    else if (source === "arcdev") { score += 15; reasons.push("Arc.dev project"); }
    else if (source === "vuejobs") { score += 12; reasons.push("VueJobs listing"); }
    else if (source === "reactjobs") { score += 12; reasons.push("ReactJobs listing"); }
    else if (source === "reddit") { score += 8; reasons.push("Reddit post"); }
  }

  if (text.includes("need a website") || text.includes("need website")) { score += 30; reasons.push("Needs website"); }
  if (text.includes("need a developer") || text.includes("looking for a developer") || text.includes("need someone to build")) { score += 25; reasons.push("Looking for developer"); }
  if (text.includes("hire") || text.includes("hiring") || text.includes("looking to hire")) { score += 20; reasons.push("Hiring"); }
  if (text.includes("freelance") || text.includes("contract") || text.includes("project")) { score += 15; reasons.push("Freelance/contract"); }
  if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("online store") || text.includes("shopify")) { score += 20; reasons.push("E-commerce"); }
  if (text.includes("web application") || text.includes("saas") || text.includes("web app")) { score += 20; reasons.push("Web app"); }
  if (text.includes("react") && (text.includes("developer") || text.includes("needed") || text.includes("hire"))) { score += 15; reasons.push("React dev"); }
  if (text.includes("angular") && (text.includes("developer") || text.includes("needed") || text.includes("hire"))) { score += 15; reasons.push("Angular dev"); }
  if (text.includes("frontend") && (text.includes("developer") || text.includes("needed") || text.includes("hire"))) { score += 15; reasons.push("Frontend dev"); }
  if (text.includes("vue") && (text.includes("developer") || text.includes("needed"))) { score += 15; reasons.push("Vue dev"); }
  if (text.includes("redesign")) { score += 15; reasons.push("Redesign"); }
  if (text.includes("custom software") || text.includes("custom application")) { score += 15; reasons.push("Custom software"); }
  if (text.includes("landing page")) { score += 10; reasons.push("Landing page"); }
  if (text.includes("wordpress") || text.includes("nextjs") || text.includes("next.js")) { score += 10; reasons.push("Framework mention"); }
  if (text.includes("budget") || text.includes("price") || text.includes("cost") || text.includes("$")) { score += 10, reasons.push("Budget"); }
  if (text.includes("company") || text.includes("business") || text.includes("agency") || text.includes("startup") || text.includes("firm")) { score += 10; reasons.push("Business"); }
  if (text.includes("urgent") || text.includes("asap") || text.includes("quickly") || text.includes("immediately")) { score += 10; reasons.push("Urgency"); }
  if (text.includes("contact") || text.includes("email") || text.includes("dm")) { score += 5; reasons.push("Contact provided"); }
  if (text.includes("how much should i charge") || text.includes("pricing advice")) { score -= 30; reasons.push("Dev asking pricing"); }
  if (text.includes("looking for a job") || text.includes("hire me") || text.includes("my portfolio")) { score -= 50; reasons.push("Job seeker"); }
  if (text.includes("free advice") || text.includes("free consultation")) { score -= 20; reasons.push("Free advice"); }

  score = Math.max(0, Math.min(100, score));
  const temperature = score >= 80 ? "hot" : score >= 50 ? "warm" : "cold";

  let serviceNeeded = "Website Development";
  if (text.includes("ecommerce") || text.includes("online store") || text.includes("shopify")) serviceNeeded = "E-commerce Website";
  else if (text.includes("web application") || text.includes("saas") || text.includes("web app")) serviceNeeded = "Web Application";
  else if (text.includes("react")) serviceNeeded = "React Development";
  else if (text.includes("angular")) serviceNeeded = "Angular Development";
  else if (text.includes("frontend") || text.includes("front-end")) serviceNeeded = "Frontend Development";
  else if (text.includes("vue")) serviceNeeded = "Vue Development";
  else if (text.includes("redesign")) serviceNeeded = "Website Redesign";
  else if (text.includes("software") || text.includes("custom")) serviceNeeded = "Custom Software";
  else if (text.includes("landing page")) serviceNeeded = "Landing Page";
  else if (text.includes("wordpress")) serviceNeeded = "WordPress Development";

  return { score, temperature, serviceNeeded, reasons };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { keywords, sources, location, dateRange, savedSearchId, mode } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization") ?? "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated");

    const { data: memberData } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!memberData) throw new Error("No workspace found");
    const workspaceId = memberData.workspace_id;

    const { data: run } = await supabase
      .from("discovery_runs")
      .insert({
        workspace_id: workspaceId,
        saved_search_id: savedSearchId || null,
        status: "running",
        started_at: new Date().toISOString(),
        keywords: keywords,
        sources: sources,
      })
      .select()
      .single();

    if (!run) throw new Error("Failed to create discovery run");

    let allPosts: any[] = [];
    let providerErrors: string[] = [];

    const searchFunction = mode === "jobs" ? "search-jobs" : "search-freelance";
    const fallbackFunction = "search-web";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      let response = await supabase.functions.invoke(searchFunction, {
        body: { keywords, location, dateRange },
        headers,
      });

      if (response.error) {
        providerErrors.push(`${searchFunction}: ${response.error.message} - falling back to search-web`);
        response = await supabase.functions.invoke(fallbackFunction, {
          body: { keywords, location, dateRange },
          headers,
        });
      }

      if (response.error) {
        providerErrors.push(`Search failed: ${response.error.message}`);
      } else if (response.data?.posts) {
        allPosts = response.data.posts;
      }
    } catch (e: any) {
      providerErrors.push(`Search: ${e.message}`);
    }

    let duplicatesRemoved = 0;
    let qualifiedLeads = 0;

    for (const post of allPosts) {
      const { data: existing } = await supabase
        .from("raw_posts")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("source", post.source)
        .eq("post_url", post.postUrl)
        .maybeSingle();

      if (existing) { duplicatesRemoved++; continue; }

      const text = `${post.title || ""} ${post.content}`.toLowerCase();
      const { score, temperature, serviceNeeded, reasons } = scorePost(text, post.source, mode);

      const { data: lead } = await supabase
        .from("leads")
        .insert({
          workspace_id: workspaceId,
          discovery_run_id: run.id,
          source: post.source,
          source_url: post.postUrl,
          title: post.title || null,
          content: post.content,
          name: post.authorName || null,
          service_needed: serviceNeeded,
          lead_score: score,
          lead_temperature: temperature,
          status: "new",
          intent_summary: reasons.join(". ") || "Public post matching keywords",
          first_detected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (lead) qualifiedLeads++;
    }

    await supabase
      .from("discovery_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_found: allPosts.length,
        total_processed: allPosts.length - duplicatesRemoved,
      })
      .eq("id", run.id);

    return new Response(
      JSON.stringify({ runId: run.id, status: "completed", totalFound: allPosts.length, duplicatesRemoved, qualifiedLeads, providerErrors, mode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
