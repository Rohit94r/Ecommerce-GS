export const ADMIN_EMAILS = [
  "sureshptl2006@gmail.com",
  "gargihealthcaresales@gmail.com",
  "rjdhav67@gmail.com",
] as const;

export function isAdminEmail(email?: string | null) {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]));
}
