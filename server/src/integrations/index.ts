// PHASE 2: Job Portal Integrations
// These will contain Playwright-based scrapers for different job portals

export interface PortalJob {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: {
    min: number;
    max: number;
  };
  url: string;
}

// TODO: Implement
// export class IndeedScraper { }
// export class LinkedInScraper { }
// export class GlassdoorScraper { }
// export class AngelListScraper { }
