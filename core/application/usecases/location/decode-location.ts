import type { LocationService } from "@/core/application/interfaces/location-service";

export interface DecodeLocationRequest {
  token: string;
  accessToken: string;
}

export interface DecodeLocationResponse {
  location: { lat: number; lng: number };
  address: string | null;
}

export class DecodeLocationUseCase {
  constructor(private locationService: LocationService) {}

  async execute(request: DecodeLocationRequest): Promise<DecodeLocationResponse> {
    return await this.locationService.decodeLocation(request.token, request.accessToken);
  }
}
