import type { StationService } from "@/core/application/interfaces/station-service";

export interface DeleteStationRequest {
  id: number;
}

export interface DeleteStationResponse {
  success: boolean;
}

export class DeleteStationUseCase {
  constructor(private stationService: StationService) {}

  async execute(request: DeleteStationRequest): Promise<DeleteStationResponse> {
    const success = await this.stationService.delete(request.id);
    return { success };
  }
}
