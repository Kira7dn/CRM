import { ZaloPhoneGateway } from '@/infrastructure/adapters/utilities/zalo-phone-gateway';
import { DecodePhoneUseCase } from '@/core/application/usecases/shared/phone/decode-phone';

const createPhoneService = async () => new ZaloPhoneGateway();

export const decodePhoneUseCase = async () => new DecodePhoneUseCase(await createPhoneService());
