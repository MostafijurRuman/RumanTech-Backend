export function notificationAudience(userId?: string) {
  return userId ? { userId } : { userId: null };
}
