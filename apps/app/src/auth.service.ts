import { userService, IUser, UserRole } from "./user.service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
  permissions: string[];
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

interface TokenValidation {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

class AuthService {
  // Simulated JWT implementation (in production use jsonwebtoken library)
  generateToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id?.toString() || "",
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    };

    // Simple base64 encoding for demo (NOT SECURE!)
    // In production: use jsonwebtoken.sign()
    const tokenData = JSON.stringify(payload);
    const encoded = Buffer.from(tokenData).toString("base64");
    return encoded;
  }

  validateToken(token: string): TokenValidation {
    try {
      // Simple base64 decoding for demo
      // In production: use jsonwebtoken.verify()
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const payload = JSON.parse(decoded) as TokenPayload;

      if (!payload.userId) {
        return { valid: false, error: "Invalid token" };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: "Token validation failed" };
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const user = await userService.getUserByUsername(credentials.username);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    const hashedInputPassword = await userService.hashPassword(
      credentials.password
    );
    const passwordMatch = hashedInputPassword === user.password;

    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id?.toString() || "",
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  hasPermission(permissions: string[], requiredPermission: string): boolean {
    return permissions.includes(requiredPermission);
  }

  hasRole(role: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.ADMIN]: 3,
      [UserRole.USER]: 2,
      [UserRole.GUEST]: 1,
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  }
}

export const authService = new AuthService();
export type { TokenPayload, LoginRequest, LoginResponse, TokenValidation };
