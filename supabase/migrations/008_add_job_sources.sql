-- Add remote job board sources
INSERT INTO sources (workspace_id, display_name, provider, is_enabled, configuration)
SELECT
  workspaces.id,
  sources_data.name,
  sources_data.provider,
  true,
  sources_data.config::jsonb
FROM workspaces
CROSS JOIN (VALUES
  ('We Work Remotely', 'weworkremotely', '{"type":"remote_board","category":"jobs","url":"https://weworkremotely.com"}'),
  ('Wellfound', 'wellfound', '{"type":"remote_board","category":"jobs","url":"https://wellfound.com/jobs"}'),
  ('Y Combinator Jobs', 'ycjobs', '{"type":"remote_board","category":"jobs","url":"https://www.ycombinator.com/jobs"}'),
  ('Remote.co', 'remoteco', '{"type":"remote_board","category":"jobs","url":"https://remote.co"}'),
  ('FlexJobs', 'flexjobs', '{"type":"remote_board","category":"jobs","url":"https://www.flexjobs.com"}'),
  ('Remotive', 'remotive', '{"type":"remote_board","category":"jobs","url":"https://remotive.com"}'),
  ('Working Nomads', 'workingnomads', '{"type":"remote_board","category":"jobs","url":"https://www.workingnomads.com/jobs"}'),
  ('RemoteOK', 'remoteok', '{"type":"remote_board","category":"jobs","url":"https://remoteok.com"}'),
  ('JustRemote', 'justremote', '{"type":"remote_board","category":"jobs","url":"https://justremote.co/remote-jobs"}'),
  ('Skip The Drive', 'skipthedrive', '{"type":"remote_board","category":"jobs","url":"https://www.skipthedrive.com"}'),
  ('Remote Rocketship', 'remoterocketship', '{"type":"remote_board","category":"jobs","url":"https://www.remoterocketship.com"}'),
  ('CareerVault', 'careervault', '{"type":"remote_board","category":"jobs","url":"https://careervault.io"}'),
  ('RemoteHub', 'remotehub', '{"type":"remote_board","category":"jobs","url":"https://www.remotehub.com/jobs"}'),
  ('FindAsync', 'findasync', '{"type":"remote_board","category":"jobs","url":"https://www.findasync.com"}'),
  ('RemoteFront', 'remotefront', '{"type":"remote_board","category":"jobs","url":"https://www.remotefront.com"}'),
  ('TopStartups', 'topstartups', '{"type":"remote_board","category":"jobs","url":"https://topstartups.io"}'),
  ('Upwork', 'upwork', '{"type":"freelance_platform","category":"freelancing","url":"https://www.upwork.com"}'),
  ('Freelancer', 'freelancer', '{"type":"freelance_platform","category":"freelancing","url":"https://www.freelancer.com"}'),
  ('Toptal', 'toptal', '{"type":"freelance_platform","category":"freelancing","url":"https://www.toptal.com"}'),
  ('Gun.io', 'gunio', '{"type":"freelance_platform","category":"freelancing","url":"https://gun.io"}'),
  ('Arc.dev', 'arcdev', '{"type":"freelance_platform","category":"freelancing","url":"https://arc.dev"}'),
  ('VueJobs', 'vuejobs', '{"type":"freelance_platform","category":"freelancing","url":"https://vuejobs.com"}'),
  ('ReactJobs', 'reactjobs', '{"type":"freelance_platform","category":"freelancing","url":"https://reactjobs.io"}'),
  ('LinkedIn', 'linkedin', '{"type":"job_board","category":"both","url":"https://linkedin.com/jobs"}'),
  ('Indeed', 'indeed', '{"type":"job_board","category":"both","url":"https://indeed.com"}'),
  ('Glassdoor', 'glassdoor', '{"type":"job_board","category":"both","url":"https://glassdoor.com"}'),
  ('Reddit', 'reddit', '{"type":"community","category":"both","url":"https://reddit.com"}'),
  ('Google Search', 'web_search', '{"type":"search_engine","category":"both","url":"https://google.com"}')
) AS sources_data(name, provider, config)
WHERE NOT EXISTS (
  SELECT 1 FROM sources
  WHERE sources.workspace_id = workspaces.id AND sources.provider = sources_data.provider
);
