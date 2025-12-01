import { OperationalCostRepository } from '@/infrastructure/repositories/sales/operational-cost-repo';
import type { OperationalCostService } from '@/core/application/interfaces/sales/operational-cost-service';
import { GetCostsUseCase } from '@/core/application/usecases/sales/operational-cost/get-costs';
import { CreateCostUseCase } from '@/core/application/usecases/sales/operational-cost/create-cost';
import { UpdateCostUseCase } from '@/core/application/usecases/sales/operational-cost/update-cost';
import { DeleteCostUseCase } from '@/core/application/usecases/sales/operational-cost/delete-cost';

// Create OperationalCostRepository instance
const createOperationalCostRepository = async (): Promise<OperationalCostService> => {
  return new OperationalCostRepository();
};

// Create use case instances
export const getCostsUseCase = async () => {
  const costService = await createOperationalCostRepository();
  return new GetCostsUseCase(costService);
};

export const createCostUseCase = async () => {
  const costService = await createOperationalCostRepository();
  return new CreateCostUseCase(costService);
};

export const updateCostUseCase = async () => {
  const costService = await createOperationalCostRepository();
  return new UpdateCostUseCase(costService);
};

export const deleteCostUseCase = async () => {
  const costService = await createOperationalCostRepository();
  return new DeleteCostUseCase(costService);
};
