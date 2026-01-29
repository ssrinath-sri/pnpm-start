/**
 * API Server with Authentication
 * 
 * This module demonstrates how to build authenticated API endpoints
 * using Express (or similar) with the auth middleware
 */

import { authMiddleware, AuthContext } from "./auth.middleware";
import { authService } from "./auth.service";
import { userService, UserRole } from "./user.service";
import { mongoService } from "./mongodb.service";

// Simulated Express-like request/response handlers
interface APIRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: any;
}

interface APIResponse {
  status: number;
  data: any;
  message?: string;
}

// Simulated API handler decorator for protected routes
function Protected(
  requiredRole?: UserRole,
  requiredPermission?: string
) {
  return (handler: Function) => {
    return async (
      req: APIRequest
    ): Promise<APIResponse> => {
      try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
          return {
            status: 401,
            data: null,
            message: "Missing authorization token",
          };
        }

        const context = authMiddleware.requireAuth(token);

        if (requiredRole) {
          authMiddleware.requireRole(context, requiredRole);
        }

        if (requiredPermission) {
          authMiddleware.requirePermission(context, requiredPermission);
        }

        return handler(req, context);
      } catch (error) {
        const message = (error as Error).message;
        if (message.includes("Unauthorized")) {
          return { status: 401, data: null, message };
        }
        if (message.includes("Forbidden")) {
          return { status: 403, data: null, message };
        }
        return { status: 400, data: null, message };
      }
    };
  };
}

// Example API Endpoints

// Public endpoint - No authentication required
async function handleLogin(req: APIRequest): Promise<APIResponse> {
  try {
    const response = await authService.login(req.body);
    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    return {
      status: 401,
      data: null,
      message: (error as Error).message,
    };
  }
}

// Protected endpoint - Requires authentication
const handleGetProfile = Protected()(
  async (req: APIRequest, context: AuthContext): Promise<APIResponse> => {
    const user = await userService.getUserById(context.userId);
    return {
      status: 200,
      data: user,
    };
  }
);

// Protected endpoint - Requires USER role or higher
const handleGetData = Protected(UserRole.USER)(
  async (req: APIRequest, context: AuthContext): Promise<APIResponse> => {
    return {
      status: 200,
      data: {
        items: ["data1", "data2", "data3"],
        userId: context.userId,
      },
    };
  }
);

// Protected endpoint - Requires ADMIN role and read:users permission
const handleListUsers = Protected(UserRole.ADMIN, "read:users")(
  async (req: APIRequest, context: AuthContext): Promise<APIResponse> => {
    const users = await userService.getAllUsers();
    return {
      status: 200,
      data: users,
    };
  }
);

// Protected endpoint - Requires ADMIN role and write:users permission
const handleDeleteUser = Protected(UserRole.ADMIN, "write:users")(
  async (req: APIRequest, context: AuthContext): Promise<APIResponse> => {
    const userId = req.body.userId;
    const success = await userService.deleteUser(userId);
    return {
      status: success ? 200 : 404,
      data: { deleted: success },
      message: success ? "User deleted" : "User not found",
    };
  }
);

// API Router
class APIRouter {
  async handleRequest(req: APIRequest): Promise<APIResponse> {
    switch (req.path) {
      case "/auth/login":
        return handleLogin(req);

      case "/api/profile":
        return handleGetProfile(req);

      case "/api/data":
        return handleGetData(req);

      case "/api/users":
        if (req.method === "GET") {
          return handleListUsers(req);
        }
        if (req.method === "DELETE") {
          return handleDeleteUser(req);
        }
        return { status: 405, data: null, message: "Method not allowed" };

      default:
        return { status: 404, data: null, message: "Endpoint not found" };
    }
  }
}

export const apiRouter = new APIRouter();
export { handleLogin, handleGetProfile, handleGetData, handleListUsers };
