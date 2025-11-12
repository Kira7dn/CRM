import type { StationService } from "@/core/application/interfaces/station-service";

export interface GetStationByIdRequest {
  id: number;
}

export interface GetStationByIdResponse {
  station: any | null;
}

export class GetStationByIdUseCase {
  constructor(private stationService: StationService) {}

  async execute(request: GetStationByIdRequest): Promise<GetStationByIdResponse> {
    const station = await this.stationService.getById(request.id);
    return { station };
  }
}
