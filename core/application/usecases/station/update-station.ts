import type { StationService } from "@/core/application/interfaces/station-service";

export interface UpdateStationRequest {
  id: number;
  name?: string;
  image?: string;
  address?: string;
  location?: { lat: number; lng: number };
}

export interface UpdateStationResponse {
  station: any | null;
}

export class UpdateStationUseCase {
  constructor(private stationService: StationService) {}

  async execute(request: UpdateStationRequest): Promise<UpdateStationResponse> {
    const { id, ...updateData } = request;
    const station = await this.stationService.update(id, updateData);
    return { station };
  }
}
