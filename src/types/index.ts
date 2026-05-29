// ============================================================
// INSTITUTO DE ARTES PILOLA — Tipos de TypeScript
// ============================================================

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  member_id: string;
  avatar_url: string | null;
  points: number;
  level: "bronce" | "plata" | "oro" | "platino";
  role: "student" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PointsHistory {
  id: string;
  user_id: string;
  points: number;
  type: "earned" | "redeemed";
  concept: string;
  assigned_by: string | null;
  created_at: string;
  // Joined fields
  assigned_by_profile?: Pick<Profile, "first_name" | "last_name">;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  month_corresponding: string;
  status: "pagado" | "pendiente";
  points_awarded: number;
  registered_by: string | null;
  created_at: string;
  // Joined fields
  profile?: Pick<Profile, "first_name" | "last_name" | "member_id">;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  points_cost: number;
  is_active: boolean;
  stock: number | null;
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: "pendiente" | "entregado" | "cancelado";
  created_at: string;
  // Joined fields
  reward?: Reward;
  profile?: Pick<Profile, "first_name" | "last_name" | "member_id">;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "points" | "reward" | "level" | "system" | "payment";
  is_read: boolean;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Niveles y sus rangos
export const LEVELS = {
  bronce: { min: 0, max: 999, label: "Bronce", color: "#CD7F32", next: "plata" },
  plata: { min: 1000, max: 2499, label: "Plata", color: "#C0C0C0", next: "oro" },
  oro: { min: 2500, max: 4999, label: "Oro", color: "#FFD700", next: "platino" },
  platino: { min: 5000, max: Infinity, label: "Platino", color: "#E5E4E2", next: null },
} as const;

export type LevelKey = keyof typeof LEVELS;

// QR Data structure
export interface QRData {
  memberId: string;
  name: string;
  email: string;
}
