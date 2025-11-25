import { ZaloLocationGateway } from '@/infrastructure/adapters/gateways/zalo-location-gateway';
import { DecodeLocationUseCase } from '@/core/application/usecases/location/decode-location';

const createLocationService = async () => new ZaloLocationGateway();

export const decodeLocationUseCase = async () => new DecodeLocationUseCase(await createLocationService());
