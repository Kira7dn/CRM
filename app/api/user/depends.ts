import { UserRepository } from '@/infrastructure/repositories/user-repo';
import { UpsertUserUseCase } from '@/core/application/usecases/user/upsert-user';
import { GetUserByIdUseCase } from '@/core/application/usecases/user/get-user-by-id';

const createUserRepository = async (): Promise<UserRepository> => new UserRepository();

export const upsertUserUseCase = async () => new UpsertUserUseCase(await createUserRepository());
export const getUserByIdUseCase = async () => new GetUserByIdUseCase(await createUserRepository());
