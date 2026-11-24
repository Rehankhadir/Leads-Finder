-- Social Lead Finder - Development Seed Data
-- Run this AFTER the main migration to populate with sample data
-- WARNING: This is for development purposes only!

-- Get the workspace ID (assumes first workspace created by trigger)
DO $$
DECLARE
  ws_id UUID;
  user_id UUID;
  lead1_id UUID;
  lead2_id UUID;
BEGIN
  -- Get the demo workspace
  SELECT id INTO ws_id FROM workspaces LIMIT 1;
  SELECT id INTO user_id FROM auth.users LIMIT 1;

  IF ws_id IS NULL OR user_id IS NULL THEN
    RAISE NOTICE 'No workspace or user found. Please sign up first.';
    RETURN;
  END IF;

  -- Insert sample keywords
  INSERT INTO keywords (workspace_id, keyword, category, is_active) VALUES
    (ws_id, 'need a website', 'website', true),
    (ws_id, 'looking for web developer', 'website', true),
    (ws_id, 'ecommerce website developer', 'ecommerce', true),
    (ws_id, 'react developer needed', 'react', true),
    (ws_id, 'website redesign', 'redesign', true),
    (ws_id, 'build web application', 'web_app', true),
    (ws_id, 'angular developer needed', 'angular', true),
    (ws_id, 'custom software development', 'software', true)
  ON CONFLICT DO NOTHING;

  -- Insert sample leads
  INSERT INTO leads (workspace_id, name, username, business_name, source, source_url, title, content, service_needed, business_type, location, contact_info, intent_summary, urgency, budget_mentioned, lead_score, lead_temperature, status)
  VALUES
    (ws_id, 'Sarah Johnson', 'sarahj_biz', 'Boutique Fashion Co', 'reddit', 'https://reddit.com/r/smallbusiness/abc123',
     'Need an ecommerce website for my clothing brand',
     'Hi everyone, I run a small clothing boutique and need someone to build me an ecommerce website. We need something with Shopify integration, inventory management, and a clean modern design. Budget is around $5000-8000. Need it done within 6 weeks.',
     'E-commerce Website', 'Clothing/Fashion', 'New York, USA',
     '{"email": "sarah@boutiquefashion.com", "phone": null, "website": "boutiquefashion.com"}',
     'Business owner actively seeking an ecommerce website developer with clear budget and timeline.',
     'high', true, 92, 'hot', 'new'),

    (ws_id, 'Mike Chen', 'mikechen_dev', 'TechStart Inc', 'reddit', 'https://reddit.com/r/startups/def456',
     'Looking for React developer for SaaS dashboard',
     'We are building a SaaS analytics platform and need an experienced React developer to help build the frontend dashboard. Looking for someone with TypeScript, Tailwind CSS, and charting library experience.',
     'React Development', 'SaaS/Technology', 'San Francisco, USA',
     '{"email": null, "phone": null, "website": "techstart.io"}',
     'Startup looking for React developer for their SaaS product frontend.',
     'medium', false, 78, 'warm', 'viewed'),

    (ws_id, 'Priya Sharma', 'priya_sharma', 'GreenLeaf Organics', 'web_search', 'https://indiehackers.com/post/ghi789',
     'Need website for organic food business',
     'Starting an organic food delivery service and need a website. Looking for something clean, modern, with online ordering capability. We are based in Mumbai, India.',
     'Website Development', 'Food/Delivery', 'Mumbai, India',
     '{"email": "priya@greenleaforganics.in", "phone": null, "website": null}',
     'New business owner needing website with e-commerce features for organic food delivery.',
     'high', false, 85, 'hot', 'new'),

    (ws_id, 'Raj Patel', 'rajpatel', 'Patel Electronics', 'web_search', 'https://indiehackers.com/post/stu901',
     'Need custom inventory management software',
     'We have a chain of electronics stores and need custom inventory management software. Something that works across all our locations with real-time stock updates, supplier management, and sales analytics.',
     'Custom Software', 'Retail/Electronics', 'Ahmedabad, India',
     '{"email": "raj@patelelectronics.in", "phone": null, "website": "patelelectronics.in"}',
     'Retail business owner seeking custom inventory management software solution.',
     'high', false, 90, 'hot', 'qualified')

  RETURNING id INTO lead1_id;

  -- Insert sample notes
  INSERT INTO lead_notes (lead_id, workspace_id, user_id, note)
  SELECT lead1_id, ws_id, user_id, 'Sent initial email on Aug 20. Waiting for response.'
  WHERE lead1_id IS NOT NULL;

  -- Insert sample activity
  INSERT INTO lead_activity (lead_id, workspace_id, user_id, activity_type)
  SELECT lead1_id, ws_id, user_id, 'created'
  WHERE lead1_id IS NOT NULL;

  RAISE NOTICE 'Seed data inserted successfully!';
END $$;
