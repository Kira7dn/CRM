import type { UserService } from "@/core/application/interfaces/user-service";

export interface UpsertUserRequest {
  id: string;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpsertUserResponse {
  user: any;
}

export class UpsertUserUseCase {
  constructor(private userService: UserService) {}

  async execute(request: UpsertUserRequest): Promise<UpsertUserResponse> {
    const user = await this.userService.upsert(request);
    return { user };
  }
}
