export const ADMIN_EMAILS: string[] = [
  "md.rabbybaparilmn@gmail.com",
  "md.rabbybaparilmn4@gmail.com",
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((e) => e.trim().toLowerCase() === target);
}
