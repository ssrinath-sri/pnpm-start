import { mongoService } from "./mongodb.service";
import { ObjectId } from "mongodb";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

export interface IUser {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface UpdateUserInput {
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

class UserService {
  private collectionName = "users";

  async createUser(userData: CreateUserInput): Promise<ObjectId> {
    const hashedPassword = await this.hashPassword(userData.password);

    const user: IUser = {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
      permissions: this.getPermissionsByRole(userData.role || UserRole.USER),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userId = await mongoService.create(this.collectionName, user);
    console.log(`User created: ${userData.username}`);
    return userId;
  }

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await mongoService.findById(this.collectionName, userId);
    return user as IUser | null;
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    const user = await mongoService.findOne(this.collectionName, { username });
    return user as IUser | null;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await mongoService.findOne(this.collectionName, { email });
    return user as IUser | null;
  }

  async updateUser(userId: string, updateData: UpdateUserInput): Promise<boolean> {
    const updatePayload = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (updateData.role) {
      updatePayload["permissions"] = this.getPermissionsByRole(updateData.role);
    }

    return mongoService.updateById(this.collectionName, userId, updatePayload);
  }

  async deleteUser(userId: string): Promise<boolean> {
    return mongoService.deleteById(this.collectionName, userId);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // In production, use bcrypt or similar
    // For demo: simple comparison (not secure!)
    return password === hash;
  }

  async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt.hash()
    // For demo: simple encoding
    return Buffer.from(password).toString("base64");
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await mongoService.findAll(this.collectionName, {
      isActive: true,
    });
    return users as IUser[];
  }

  private getPermissionsByRole(role: UserRole): string[] {
    const permissionMap: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: [
        "read:users",
        "write:users",
        "delete:users",
        "read:data",
        "write:data",
        "delete:data",
      ],
      [UserRole.USER]: ["read:data", "write:data"],
      [UserRole.GUEST]: ["read:data"],
    };

    return permissionMap[role] || [];
  }
}

export const userService = new UserService();
