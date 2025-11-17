import { AdminUserRepository } from "@/infrastructure/repositories/admin-user-repo"
import type { AdminUserService } from "@/core/application/interfaces/admin-user-service"

// Use cases
import { LoginUseCase } from "@/core/application/usecases/admin-user/login"
import { RegisterAdminUserUseCase } from "@/core/application/usecases/admin-user/register"
import { GetCurrentUserUseCase } from "@/core/application/usecases/admin-user/get-current-user"
import { ChangePasswordUseCase } from "@/core/application/usecases/admin-user/change-password"
import { GetAllUsersUseCase } from "@/core/application/usecases/admin-user/get-all-users"
import { UpdateAdminUserUseCase } from "@/core/application/usecases/admin-user/update-user"
import { DeleteAdminUserUseCase } from "@/core/application/usecases/admin-user/delete-user"

// Repository factory
const createAdminUserRepository = async (): Promise<AdminUserService> => {
  return new AdminUserRepository()
}

// Use case factories
export const createLoginUseCase = async () => {
  const service = await createAdminUserRepository()
  return new LoginUseCase(service)
}

export const createRegisterAdminUserUseCase = async () => {
  const service = await createAdminUserRepository()
  return new RegisterAdminUserUseCase(service)
}

export const createGetCurrentUserUseCase = async () => {
  const service = await createAdminUserRepository()
  return new GetCurrentUserUseCase(service)
}

export const createChangePasswordUseCase = async () => {
  const service = await createAdminUserRepository()
  return new ChangePasswordUseCase(service)
}

export const createGetAllUsersUseCase = async () => {
  const service = await createAdminUserRepository()
  return new GetAllUsersUseCase(service)
}

export const createUpdateAdminUserUseCase = async () => {
  const service = await createAdminUserRepository()
  return new UpdateAdminUserUseCase(service)
}

export const createDeleteAdminUserUseCase = async () => {
  const service = await createAdminUserRepository()
  return new DeleteAdminUserUseCase(service)
}
