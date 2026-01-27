-- Create Categories Table
CREATE TABLE IF NOT EXISTS strategy_channel_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Channels Table
CREATE TABLE IF NOT EXISTS strategy_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES strategy_channel_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- Enable RLS (Security)
ALTER TABLE strategy_channel_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_channels ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Modify policy as needed for your specific auth model)
CREATE POLICY "Allow public read categories" ON strategy_channel_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read channels" ON strategy_channels FOR SELECT USING (true);

-- Function to seed data (idempotent-ish via DO block not easily possible in pure SQL editor window sometimes, simply inserting with ON CONFLICT DO NOTHING)

-- Insert Categories and Channels
DO $$
DECLARE
    cat_id UUID;
BEGIN
    -- Social Media - Organic
    INSERT INTO strategy_channel_categories (name) VALUES ('Social Media - Organic') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Pinterest (Organic)'),
        (cat_id, 'Snapchat (Organic)'),
        (cat_id, 'Threads (Organic)'),
        (cat_id, 'Mastodon (Organic)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Social Media - Paid
    INSERT INTO strategy_channel_categories (name) VALUES ('Social Media - Paid') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Pinterest Ads'),
        (cat_id, 'Snapchat Ads')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Messaging Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Messaging Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'WhatsApp Business'),
        (cat_id, 'Telegram Channels'),
        (cat_id, 'WeChat (for China market)'),
        (cat_id, 'LINE (for Asian markets)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Video Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Video Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Vimeo'),
        (cat_id, 'Wistia'),
        (cat_id, 'Dailymotion'),
        (cat_id, 'Twitch')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Professional Networks
    INSERT INTO strategy_channel_categories (name) VALUES ('Professional Networks') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'AngelList'),
        (cat_id, 'Crunchbase'),
        (cat_id, 'Wellfound (formerly AngelList Talent)'),
        (cat_id, 'GitHub Sponsors')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- B2B Marketplaces
    INSERT INTO strategy_channel_categories (name) VALUES ('B2B Marketplaces') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Alibaba'),
        (cat_id, 'ThomasNet'),
        (cat_id, 'Kompass'),
        (cat_id, 'Global Sources')
    ON CONFLICT (category_id, name) DO NOTHING;

     -- Industry Associations
    INSERT INTO strategy_channel_categories (name) VALUES ('Industry Associations') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Association Memberships/Directories'),
        (cat_id, 'Association Newsletters'),
        (cat_id, 'Association Events')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Analyst Firms
    INSERT INTO strategy_channel_categories (name) VALUES ('Analyst Firms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Gartner Reports'),
        (cat_id, 'Forrester Reports'),
        (cat_id, 'IDC Reports')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Job Boards (Employer Branding)
    INSERT INTO strategy_channel_categories (name) VALUES ('Job Boards (Employer Branding)') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'LinkedIn Jobs (Employer Brand)'),
        (cat_id, 'Indeed (Employer Brand)'),
        (cat_id, 'Glassdoor (Company Reviews)'),
        (cat_id, 'Built In')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Educational Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Educational Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Coursera (Corporate Training)'),
        (cat_id, 'LinkedIn Learning (Sponsorships)'),
        (cat_id, 'Udemy Business'),
        (cat_id, 'Industry Certification Programs')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- News Aggregators
    INSERT INTO strategy_channel_categories (name) VALUES ('News Aggregators') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Flipboard'),
        (cat_id, 'Feedly (Featured Collections)'),
        (cat_id, 'SmartNews')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Business Directories
    INSERT INTO strategy_channel_categories (name) VALUES ('Business Directories') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Better Business Bureau (BBB)'),
        (cat_id, 'Yellow Pages (Business)'),
        (cat_id, 'Yelp for Business'),
        (cat_id, 'Local Chamber Directories')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Sponsored Content Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Sponsored Content Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Forbes BrandVoice'),
        (cat_id, 'Harvard Business Review (Sponsored)'),
        (cat_id, 'Inc. (Sponsored)'),
        (cat_id, 'Entrepreneur (Sponsored)'),
        (cat_id, 'Fast Company (Sponsored)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Communication Tools (Marketing)
    INSERT INTO strategy_channel_categories (name) VALUES ('Communication Tools (Marketing)') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Slack App Directory (Ads/Listings)'),
        (cat_id, 'Microsoft Teams App Store'),
        (cat_id, 'Zoom Apps Marketplace'),
        (cat_id, 'Google Chat Apps')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Q&A Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Q&A Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Stack Exchange Networks'),
        (cat_id, 'Yahoo Answers (B2B sections)'),
        (cat_id, 'Alignable')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Industry News Sites
    INSERT INTO strategy_channel_categories (name) VALUES ('Industry News Sites') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'TechCrunch (for tech B2B)'),
        (cat_id, 'VentureBeat'),
        (cat_id, 'Business Insider'),
        (cat_id, 'Axios'),
        (cat_id, 'The Information')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Financial/Business Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Financial/Business Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Bloomberg Terminal (Company Profiles)'),
        (cat_id, 'Reuters'),
        (cat_id, 'MarketWatch'),
        (cat_id, 'Seeking Alpha (for public companies)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Academic/Research
    INSERT INTO strategy_channel_categories (name) VALUES ('Academic/Research') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'ResearchGate'),
        (cat_id, 'Academia.edu'),
        (cat_id, 'SSRN (for research-backed content)'),
        (cat_id, 'University Research Partnerships')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Comparison & Buying Guide Sites
    INSERT INTO strategy_channel_categories (name) VALUES ('Comparison & Buying Guide Sites') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Business.com'),
        (cat_id, 'Finances Online'),
        (cat_id, 'SoftwareSuggest'),
        (cat_id, 'Featured Customers')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Local Business
    INSERT INTO strategy_channel_categories (name) VALUES ('Local Business') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Google Business Profile'),
        (cat_id, 'Bing Places'),
        (cat_id, 'Apple Maps Business')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- SMS/MMS Marketing
    INSERT INTO strategy_channel_categories (name) VALUES ('SMS/MMS Marketing') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'SMS Campaigns'),
        (cat_id, 'MMS Campaigns (multimedia)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Outdoor/OOH (B2B Specific)
    INSERT INTO strategy_channel_categories (name) VALUES ('Outdoor/OOH (B2B Specific)') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Airport Lounges'),
        (cat_id, 'Executive Shuttles/Transportation'),
        (cat_id, 'Business District Billboards'),
        (cat_id, 'Golf Course Advertising'),
        (cat_id, 'Marina/Yacht Club Advertising')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Print (B2B Specific)
    INSERT INTO strategy_channel_categories (name) VALUES ('Print (B2B Specific)') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Industry Trade Magazines'),
        (cat_id, 'Business Class Airline Magazines'),
        (cat_id, 'Hotel Business Magazines'),
        (cat_id, 'Airport Lounge Publications')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Sponsorship Opportunities
    INSERT INTO strategy_channel_categories (name) VALUES ('Sponsorship Opportunities') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Industry Awards Sponsorship'),
        (cat_id, 'Research Report Sponsorship'),
        (cat_id, 'Charity Events (B2B Networking)'),
        (cat_id, 'Golf Tournaments'),
        (cat_id, 'Executive Retreats')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Influencer Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Influencer Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'LinkedIn Top Voices'),
        (cat_id, 'Twitter/X Thought Leaders'),
        (cat_id, 'Industry-Specific Influencers'),
        (cat_id, 'Micro-Influencer Networks')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Data & Research Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Data & Research Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Statista (Brand Presence)'),
        (cat_id, 'CB Insights'),
        (cat_id, 'PitchBook (for fundraising visibility)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- CRM Integration Marketplaces
    INSERT INTO strategy_channel_categories (name) VALUES ('CRM Integration Marketplaces') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Salesforce AppExchange'),
        (cat_id, 'HubSpot Marketplace'),
        (cat_id, 'Pipedrive Marketplace'),
        (cat_id, 'Zoho Marketplace')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- E-commerce Platforms (B2B)
    INSERT INTO strategy_channel_categories (name) VALUES ('E-commerce Platforms (B2B)') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Amazon Business'),
        (cat_id, 'Alibaba.com'),
        (cat_id, 'Made-in-China.com'),
        (cat_id, 'TradeIndia')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Web Push Notifications
    INSERT INTO strategy_channel_categories (name) VALUES ('Web Push Notifications') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Browser Push Notifications'),
        (cat_id, 'Mobile App Push Notifications')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Live Chat Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Live Chat Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Intercom'),
        (cat_id, 'Drift'),
        (cat_id, 'LiveChat'),
        (cat_id, 'Zendesk Chat')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Review Aggregators
    INSERT INTO strategy_channel_categories (name) VALUES ('Review Aggregators') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Trustpilot'),
        (cat_id, 'Reviews.io'),
        (cat_id, 'Shopper Approved'),
        (cat_id, 'Birdeye')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Presentation Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Presentation Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'SlideShare (LinkedIn)'),
        (cat_id, 'Prezi Showcase'),
        (cat_id, 'Speaker Deck')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Documentation Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Documentation Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Notion (Public Pages)'),
        (cat_id, 'GitBook'),
        (cat_id, 'Read the Docs')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- No-Code/Low-Code Directories
    INSERT INTO strategy_channel_categories (name) VALUES ('No-Code/Low-Code Directories') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Zapier App Directory'),
        (cat_id, 'Make (Integromat) Marketplace'),
        (cat_id, 'IFTTT Platform')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- API Directories
    INSERT INTO strategy_channel_categories (name) VALUES ('API Directories') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'RapidAPI Marketplace'),
        (cat_id, 'ProgrammableWeb'),
        (cat_id, 'APIs.guru')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Chrome Extensions
    INSERT INTO strategy_channel_categories (name) VALUES ('Chrome Extensions') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Chrome Web Store (B2B Tools)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Sustainability/ESG Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Sustainability/ESG Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'B Corp Directory'),
        (cat_id, 'EcoVadis'),
        (cat_id, 'CDP (Carbon Disclosure Project)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Franchise/License Directories
    INSERT INTO strategy_channel_categories (name) VALUES ('Franchise/License Directories') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Franchise Direct'),
        (cat_id, 'FranchiseGator (for B2B franchises)')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Patent & IP Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('Patent & IP Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Google Patents (Thought Leadership)'),
        (cat_id, 'USPTO Publications')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Voice Assistants
    INSERT INTO strategy_channel_categories (name) VALUES ('Voice Assistants') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Alexa Skills (B2B)'),
        (cat_id, 'Google Assistant Actions'),
        (cat_id, 'Siri Shortcuts')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- AR/VR Platforms
    INSERT INTO strategy_channel_categories (name) VALUES ('AR/VR Platforms') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'Meta Quest Store (B2B Apps)'),
        (cat_id, 'Microsoft HoloLens Marketplace')
    ON CONFLICT (category_id, name) DO NOTHING;

    -- Blockchain/Web3 (Emerging B2B)
    INSERT INTO strategy_channel_categories (name) VALUES ('Blockchain/Web3 (Emerging B2B)') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO strategy_channels (category_id, name) VALUES 
        (cat_id, 'NFT Communities (B2B focused)'),
        (cat_id, 'DAO Participation'),
        (cat_id, 'Web3 Forums')
    ON CONFLICT (category_id, name) DO NOTHING;

END $$;
