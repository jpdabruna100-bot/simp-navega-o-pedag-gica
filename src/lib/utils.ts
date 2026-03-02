import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata data ISO (YYYY-MM-DD) para padrão brasileiro (DD/MM/YYYY) */
export function formatBRDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (y && m && d) return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  return dateStr;
}
