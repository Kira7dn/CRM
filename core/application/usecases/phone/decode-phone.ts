import type { PhoneService } from "@/core/application/interfaces/phone-service";

export interface DecodePhoneRequest {
  token: string;
  accessToken: string;
}

export interface DecodePhoneResponse {
  phone: string;
}

export class DecodePhoneUseCase {
  constructor(private phoneService: PhoneService) {}

  async execute(request: DecodePhoneRequest): Promise<DecodePhoneResponse> {
    const phone = await this.phoneService.decodePhone(request.token, request.accessToken);
    return { phone };
  }
}
