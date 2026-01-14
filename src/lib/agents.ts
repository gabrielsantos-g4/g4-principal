export interface Agent {
    id: string
    name: string
    role: string
    avatar: string
    printUrl?: string
    slug: string
    externalUrl?: string
    category: 'business' | 'strategy' | 'execution' | 'management' | 'bi'
    description: string
}

export const AGENTS: Agent[] = [
    // BUSINESS
    {
        id: 'crm-emily',
        name: 'Emily',
        role: 'CRM & Business',
        slug: 'crm',
        category: 'business',
        avatar: 'https://i.pinimg.com/736x/1c/22/8b/1c228b39c34d484e87b2c93c8a215159.jpg',
        printUrl: 'https://i.pinimg.com/736x/b6/c8/2f/b6c82f9477a777af7249387fe4b41208.jpg',
        externalUrl: 'https://crm.startg4.com',
        description: 'I centralize qualified leads, track their stage, and define next steps.'
    },
    // STRATEGY
    {
        id: 'ceo-brian',
        name: 'Brian',
        role: 'Head of Growth',
        slug: 'ceo-positioning',
        category: 'strategy',
        avatar: 'https://i.pinimg.com/736x/a7/29/ab/a729ab80956a484767add491b6fb4e2c.jpg',
        printUrl: 'https://i.pinimg.com/736x/71/86/85/718685e1acaa5a6d44a64426c9ac2283.jpg',
        externalUrl: 'https://ceo.startg4.com',
        description: 'I help you define your positioning and bring clarity to your strategic decisions.'
    },
    {
        id: 'audience-luke',
        name: 'Luke',
        role: 'Audience & Channels',
        slug: 'audience-channels',
        category: 'strategy',
        avatar: 'https://i.pinimg.com/736x/e0/af/9e/e0af9e4a18ae1113820e9dbcf030220b.jpg',
        printUrl: 'https://i.pinimg.com/736x/58/c2/4c/58c24cddaf8e4263f1f5d327bde06573.jpg',
        externalUrl: 'https://audience.startg4.com',
        description: 'I help you understand how your audience behaves and which channels resonate with them.'
    },
    {
        id: 'competitors-celine',
        name: 'Celine',
        role: 'Competitors Analysis',
        slug: 'competitors-analysis',
        category: 'strategy',
        avatar: 'https://i.pinimg.com/736x/00/8c/0b/008c0bc9ebc79b1e2c0f8fffe8f81183.jpg',
        printUrl: 'https://i.pinimg.com/736x/49/3e/70/493e70b549d26b06beb03d8dc3e02c76.jpg',
        externalUrl: 'https://competitors.startg4.com',
        description: 'I help you analyze competitors to uncover blind spots, recent moves, and missed opportunities.'
    },
    {
        id: 'strategy-liz',
        name: 'Liz',
        role: 'Strategy Overview',
        slug: 'strategy-overview',
        category: 'strategy',
        avatar: 'https://i.pinimg.com/736x/8b/e6/dd/8be6dd253701af4f23770a4e8035f575.jpg',
        printUrl: 'https://i.pinimg.com/736x/49/68/7c/49687c7d310d4eeda8ae5532029a3c49.jpg',
        externalUrl: 'https://overview.startg4.com',
        description: 'I help you see your entire marketing and sales strategy in one clear view.'
    },
    // EXECUTION
    {
        id: 'outreach-amanda',
        name: 'Amanda',
        role: 'Outreach',
        slug: 'outreach',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/7d/93/23/7d93231116556bd9ca38290094035828.jpg',
        printUrl: 'https://i.pinimg.com/736x/e5/07/f9/e507f9a419986f61a8b454951492a305.jpg',
        externalUrl: 'https://outreach.startg4.com',
        description: 'I scan the market and build lists of best-fit prospects for your business.'
    },
    {
        id: 'messenger-paul',
        name: 'Paul',
        role: 'Messenger',
        slug: 'messenger',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/3b/0c/7f/3b0c7f1d3cdaab04a02efd0c3da6670f.jpg',
        printUrl: 'https://i.pinimg.com/736x/29/01/47/290147dbffe02a8e6ffb132759e78fb1.jpg',
        externalUrl: 'https://messenger.startg4.com',
        description: 'I send sequenced messages and manage follow-ups across channels at scale.'
    },
    {
        id: 'customer-jess',
        name: 'Jess',
        role: 'Customer Support',
        slug: 'customer-support',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/24/29/61/2429617ce5e50f631606f92b65aaeb0f.jpg',
        printUrl: 'https://i.pinimg.com/736x/1c/6a/38/1c6a38bf8b2fa1916a35ad0c8c1becfc.jpg',
        externalUrl: 'https://customer-support.startg4.com',
        description: 'I handle support, lead nurturing, and education from inbound or outreach flows.'
    },
    {
        id: 'design-melinda',
        name: 'Melinda',
        role: 'Design & Video',
        slug: 'design-video',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/d9/dd/c2/d9ddc27d2a07dc48e539146bf5d8eb48.jpg',
        printUrl: 'https://i.pinimg.com/736x/0e/d9/06/0ed90668c479f968f524251e2814695d.jpg',
        externalUrl: 'https://design.startg4.com',
        description: 'I create visuals and edit videos quickly for ads, content, and sales assets.'
    },
    {
        id: 'copy-noah',
        name: 'Noah',
        role: 'Copy & Messaging',
        slug: 'copy-messaging',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/fc/9d/56/fc9d561d46549ccf9f252f5a23137765.jpg',
        printUrl: 'https://i.pinimg.com/736x/c5/0e/3f/c50e3f57ed136ec97fdfaadb01f21f2c.jpg',
        externalUrl: 'https://copy.startg4.com',
        description: 'I write copy aligned with the creative and map how it looks on each platform.'
    },
    {
        id: 'organic-lauren',
        name: 'Lauren',
        role: 'Organic Social',
        slug: 'organic-social',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/0d/e8/cb/0de8cb2cdf0881c16dd36f99dbac600c.jpg',
        printUrl: 'https://i.pinimg.com/736x/50/31/bb/5031bb03651c9a2752edb00a3f4cbb1a.jpg',
        externalUrl: 'https://organic-social.startg4.com',
        description: 'I plan content strategy, schedule posts, publish, and track performance.'
    },
    {
        id: 'paid-social-john',
        name: 'John',
        role: 'Paid Social',
        slug: 'paid-social',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/30/66/80/30668098a6571721adaccd7de8b0e4df.jpg',
        // No printUrl needed, uses real app
        externalUrl: 'https://paid-social.startg4.com',
        description: 'I set up paid social campaigns and monitor results in a simple way.'
    },
    {
        id: 'seo-joelle',
        name: 'Joelle',
        role: 'Organic Search (SEO)',
        slug: 'organic-search',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/70/47/86/7047860f62606dd66724cf3a18a5bf6b.jpg',
        printUrl: 'https://i.pinimg.com/736x/16/14/20/161420cb01b984997060313a209fd608.jpg',
        externalUrl: 'https://organic-search.startg4.com',
        description: 'I create practical SEO files to launch and structure your organic channel.'
    },
    {
        id: 'paid-search-david',
        name: 'David',
        role: 'Paid Search',
        slug: 'paid-search',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/99/c8/3a/99c83a145f1d73d1af66617acb500e7f.jpg',
        printUrl: 'https://i.pinimg.com/736x/4f/5b/dc/4f5bdc2cc15b4a4e2ae78121b35fe407.jpg',
        externalUrl: 'https://paid-search.startg4.com',
        description: 'I research keywords and build paid search ads across platforms.'
    },
    {
        id: 'landing-jacob',
        name: 'Jacob',
        role: 'Landing Page',
        slug: 'landing-page',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/c0/06/22/c006224163522825e0558a61e0a9631f.jpg',
        printUrl: 'https://i.pinimg.com/736x/42/8d/99/428d99f4d7fcaf422149aa282d7ef573.jpg',
        externalUrl: 'https://landing-page.startg4.com',
        description: 'I build landing pages fast to clearly explain your product or offer.'
    },
    {
        id: 'utm-bella',
        name: 'Bella',
        role: 'UTM Tracking',
        slug: 'utm-tracking',
        category: 'execution',
        avatar: 'https://i.pinimg.com/736x/e3/84/bb/e384bba92cfbe0b20581b525c3d17e71.jpg',
        printUrl: 'https://i.pinimg.com/736x/4a/dd/c8/4addc82fa51ca1f0122bb4078fed6988.jpg',
        externalUrl: 'https://utm.startg4.com',
        description: 'I create and organize UTM links across all campaigns.'
    },
    // BI & DATA ANALYSIS
    {
        id: 'bi-agatha',
        name: 'Agatha',
        role: 'BI',
        slug: 'bi-data-analysis',
        category: 'bi',
        avatar: 'https://i.pinimg.com/736x/00/8c/0b/008c0bc9ebc79b1e2c0f8fffe8f81183.jpg', // Reusing Celine's avatar for now
        externalUrl: 'https://bi.startg4.com',
        description: 'I monitor your metrics and provide actionable insights for growth.'
    },
]
