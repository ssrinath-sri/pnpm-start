import { authService, TokenValidation } from "./auth.service";
import { UserRole } from "./user.service";

export interface AuthContext {
  userId: string;
  username: string;
  role: UserRole;
  permissions: string[];
}

class AuthMiddleware {
  extractToken(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  verifyToken(token: string): TokenValidation {
    return authService.validateToken(token);
  }

  requireAuth(token: string): AuthContext {
    const validation = this.verifyToken(token);

    if (!validation.valid || !validation.payload) {
      throw new Error("Unauthorized: Invalid or missing token");
    }

    return {
      userId: validation.payload.userId,
      username: validation.payload.username,
      role: validation.payload.role,
      permissions: validation.payload.permissions,
    };
  }

  requireRole(context: AuthContext, role: UserRole): void {
    if (!authService.hasRole(context.role, role)) {
      throw new Error(
        `Forbidden: Required role ${role}, got ${context.role}`
      );
    }
  }

  requirePermission(context: AuthContext, permission: string): void {
    if (!authService.hasPermission(context.permissions, permission)) {
      throw new Error(`Forbidden: Required permission ${permission}`);
    }
  }

  // Middleware factory for route protection
  protected(requiredRole?: UserRole, requiredPermission?: string) {
    return (token: string): AuthContext => {
      const context = this.requireAuth(token);

      if (requiredRole) {
        this.requireRole(context, requiredRole);
      }

      if (requiredPermission) {
        this.requirePermission(context, requiredPermission);
      }

      return context;
    };
  }
}

export const authMiddleware = new AuthMiddleware();
export type { AuthContext };
