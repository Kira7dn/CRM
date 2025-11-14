import { StationRepository } from '@/infrastructure/repositories/station-repo';
import type { StationService } from '@/core/application/interfaces/station-service';
import { GetStationsUseCase } from '@/core/application/usecases/station/get-stations';
import { CreateStationUseCase } from '@/core/application/usecases/station/create-station';
import { GetStationByIdUseCase } from '@/core/application/usecases/station/get-station-by-id';
import { UpdateStationUseCase } from '@/core/application/usecases/station/update-station';
import { DeleteStationUseCase } from '@/core/application/usecases/station/delete-station';

// Create StationRepository instance
const createStationRepository = async (): Promise<StationService> => {
  return new StationRepository();
};

// Create use case instances
export const getStationsUseCase = async () => {
  const stationService = await createStationRepository();
  return new GetStationsUseCase(stationService);
};

export const createStationUseCase = async () => {
  const stationService = await createStationRepository();
  return new CreateStationUseCase(stationService);
};

export const getStationByIdUseCase = async () => {
  const stationService = await createStationRepository();
  return new GetStationByIdUseCase(stationService);
};

export const updateStationUseCase = async () => {
  const stationService = await createStationRepository();
  return new UpdateStationUseCase(stationService);
};

export const deleteStationUseCase = async () => {
  const stationService = await createStationRepository();
  return new DeleteStationUseCase(stationService);
};
