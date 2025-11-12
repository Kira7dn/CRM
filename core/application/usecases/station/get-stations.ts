import type { StationService } from "@/core/application/interfaces/station-service";

export interface GetStationsResponse {
  stations: any[]; // specific type
}

export class GetStationsUseCase {
  constructor(private stationService: StationService) {}

  async execute(): Promise<GetStationsResponse> {
    const stations = await this.stationService.getAll();
    return { stations };
  }
}
