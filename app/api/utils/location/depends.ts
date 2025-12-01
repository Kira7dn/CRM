import { ZaloLocationGateway } from '@/infrastructure/adapters/external/utilities/zalo-location-gateway';
import { DecodeLocationUseCase } from '@/core/application/usecases/shared/location/decode-location';

const createLocationService = async () => new ZaloLocationGateway();

export const decodeLocationUseCase = async () => new DecodeLocationUseCase(await createLocationService());
