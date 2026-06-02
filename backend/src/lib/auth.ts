import jwt from 'jsonwebtoken';

export interface UserToken {
  id: string;
  email: string;
  role: string;
}

export function getUserFromToken(authHeader?: string): UserToken | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-secret-key') as UserToken;
  } catch {
    return null;
  }
}

export function requireRole(user: UserToken, roles: string[]) {
  return roles.includes(user.role);
}
