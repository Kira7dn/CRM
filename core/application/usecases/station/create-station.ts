import type { StationService } from "@/core/application/interfaces/station-service";

export interface CreateStationRequest {
  id?: number;
  name: string;
  image?: string;
  address: string;
  location: { lat: number; lng: number };
}

export interface CreateStationResponse {
  station: any;
}

export class CreateStationUseCase {
  constructor(private stationService: StationService) {}

  async execute(request: CreateStationRequest): Promise<CreateStationResponse> {
    const station = await this.stationService.create(request);
    return { station };
  }
}
