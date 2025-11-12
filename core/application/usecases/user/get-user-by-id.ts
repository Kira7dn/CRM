import type { UserService } from "@/core/application/interfaces/user-service";

export interface GetUserByIdRequest {
  id: string;
}

export interface GetUserByIdResponse {
  user: any | null;
}

export class GetUserByIdUseCase {
  constructor(private userService: UserService) {}

  async execute(request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    const user = await this.userService.getById(request.id);
    return { user };
  }
}
