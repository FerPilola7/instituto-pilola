import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula el progreso del usuario hacia el siguiente nivel
 */
export function getLevelProgress(points: number): {
  currentLevel: string;
  nextLevel: string | null;
  progress: number;
  pointsToNext: number;
} {
  if (points >= 5000) {
    return { currentLevel: "platino", nextLevel: null, progress: 100, pointsToNext: 0 };
  } else if (points >= 2500) {
    return {
      currentLevel: "oro",
      nextLevel: "platino",
      progress: ((points - 2500) / 2500) * 100,
      pointsToNext: 5000 - points,
    };
  } else if (points >= 1000) {
    return {
      currentLevel: "plata",
      nextLevel: "oro",
      progress: ((points - 1000) / 1500) * 100,
      pointsToNext: 2500 - points,
    };
  } else {
    return {
      currentLevel: "bronce",
      nextLevel: "plata",
      progress: (points / 1000) * 100,
      pointsToNext: 1000 - points,
    };
  }
}

/**
 * Formatea una fecha relativa en español
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Ahora mismo";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

/**
 * Formatea número con separador de miles
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("es-MX");
}
