import type { Station } from "@/core/domain/managements/station"
import type { StationService, StationPayload } from "@/core/application/interfaces/station-service"

export interface CreateStationRequest extends StationPayload { }

export interface CreateStationResponse {
  station: Station
}

export class CreateStationUseCase {
  constructor(private stationService: StationService) { }

  async execute(request: CreateStationRequest): Promise<CreateStationResponse> {
    const station = await this.stationService.create(request)
    return { station }
  }
}
