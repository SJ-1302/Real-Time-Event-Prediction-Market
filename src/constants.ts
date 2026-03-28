import React from 'react';
import { LayoutGrid, Sparkles, TrendingUp } from 'lucide-react';

// ─── Market Categories (Header Navigation) ─────────────────────────────────
export const CATEGORIES = ['All Events', 'New', 'Trending'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS = [
  React.createElement(LayoutGrid, { size: 16 }),
  React.createElement(Sparkles, { size: 16 }),
  React.createElement(TrendingUp, { size: 16 }),
];

// ─── Sectors / Categories (Single Source of Truth) ──────────────────────────
// Used by: PendingEventsSection, ActiveEventsSection, FilterDialog
export const AVAILABLE_SECTORS = [
  'Technology', 'Business', 'Politics', 'Crypto', 'Sports', 'Finance', 'AI/ML',
  'Health', 'Climate', 'Entertainment', 'Science', 'Economics', 'Social Media',
  'Gaming', 'Real Estate', 'Energy', 'Space', 'Education', 'Transportation',
  'Food & Beverage', 'Fashion', 'Automotive', 'Defense', 'Agriculture',
  'Biotechnology', 'Cybersecurity', 'E-commerce', 'Media', 'Manufacturing',
  'Telecommunications', 'Insurance', 'Banking', 'Retail', 'Hospitality',
  'Construction', 'Mining', 'Pharmaceuticals', 'Logistics', 'Aviation',
  'Maritime', 'Legal', 'Consulting', 'Marketing', 'HR & Recruiting',
  'Economy', 'US', 'Japan', 'Environment', 'Movies', 'Apple', 'Tech',
] as const;

// ─── Countries (Filter Dialog) ─────────────────────────────────────────────
export const ALL_COUNTRIES = [
  'USA', 'China', 'India', 'UK', 'Germany', 'France', 'Japan', 'Brazil',
  'Canada', 'Australia', 'Russia', 'South Korea', 'Mexico', 'Italy', 'Spain',
  'Netherlands', 'Switzerland', 'Singapore', 'UAE', 'Saudi Arabia', 'Turkey',
  'Argentina', 'Indonesia', 'Thailand', 'Vietnam', 'Poland', 'Sweden', 'Norway',
] as const;

// ─── Filter Timeframes ─────────────────────────────────────────────────────
export const TIMEFRAMES = [
  'Next 24 Hours', 'Next Week', 'Next Month', 'Next 3 Months',
] as const;

// ─── Admin Email ────────────────────────────────────────────────────────────
export const ADMIN_EMAIL = 'shreyanshjain.cse@gmail.com';

// ─── API Config ─────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
