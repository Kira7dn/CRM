import type { StationService } from "@/core/application/interfaces/station-service";
import type { Station } from "@/core/domain/managements/station";

export interface GetStationsResponse {
  stations: Station[];
}

export class GetStationsUseCase {
  constructor(private stationService: StationService) { }

  async execute(): Promise<GetStationsResponse> {
    const stations = await this.stationService.getAll();
    return { stations };
  }
}
