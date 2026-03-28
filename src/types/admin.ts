import { EventStatus } from './market';

export interface PendingEvent {
  id: string;
  question: string;
  submittedBy: string;
  category: string | string[];
  suggestedProbability: number;
  estimatedVolume: string;
  submittedAt: string;
  expirationDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ActiveEventAdmin {
  id: number;
  question: string;
  category: string | string[];
  probability: number;
  volume: string;
  participants?: number;
  expirationDate: string;
  expirationTime?: string;
  status: EventStatus;
}

export interface PlatformActivity {
  day: string;
  events: number;
  volume: number;
}

export interface AdminPortalData {
  pendingEvents: PendingEvent[];
  activeEvents: ActiveEventAdmin[];
  allUsers: import('./user').AdminUser[];
  platformActivity: PlatformActivity[];
}

export interface SiteConfig {
  name: string;
  logo?: string;
  primaryColor?: string;
  footerLinks: string[];
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
}
