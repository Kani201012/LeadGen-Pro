export interface Lead {
  id: string; // Unique ID for UI management
  name: string;
  address: string;
  phone: string;
  website: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
}

export interface SearchParams {
  term: string;
  location: string;
  count: number;
}

export interface SearchHistoryItem extends SearchParams {
  id: string;
  timestamp: number;
  resultsCount: number;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type PlanTier = 'FREE' | 'PRO' | 'BUSINESS';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  price: number;
  maxLeadsPerSearch: number;
  features: string[];
  recommended?: boolean;
}