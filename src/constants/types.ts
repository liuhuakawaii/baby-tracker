export type Gender = 'male' | 'female';

export type FeedingType = 'bottle_breast' | 'bottle_formula' | 'direct';

export type BreastSide = 'left' | 'right' | 'both';

export type DiaperType = 'wet' | 'dirty' | 'mixed';

export type RecordType = 'feeding' | 'diaper';

export interface Baby {
  id: number;
  name: string;
  gender: Gender;
  birthday: string; // ISO date
  height: number; // cm
  weight: number; // kg
  created_at: string;
}

export interface Record {
  id: number;
  baby_id: number;
  type: RecordType;
  created_at: string; // ISO datetime

  // feeding fields
  feeding_type?: FeedingType;
  amount_ml?: number;
  duration_min?: number;
  breast_side?: BreastSide;

  // diaper fields
  diaper_type?: DiaperType;

  note?: string;
}

export interface AIConfig {
  base_url: string;
  api_key: string;
  model: string;
}
