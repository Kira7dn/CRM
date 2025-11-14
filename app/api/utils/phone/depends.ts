import { ZaloPhoneGateway } from '@/infrastructure/gateways/zalo-phone-gateway';
import { DecodePhoneUseCase } from '@/core/application/usecases/phone/decode-phone';

const createPhoneService = async () => new ZaloPhoneGateway();

export const decodePhoneUseCase = async () => new DecodePhoneUseCase(await createPhoneService());
