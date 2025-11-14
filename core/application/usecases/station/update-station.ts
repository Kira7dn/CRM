import type { Station } from "@/core/domain/station"
import type { StationService, StationPayload } from "@/core/application/interfaces/station-service"

export interface UpdateStationRequest extends StationPayload {}

export interface UpdateStationResponse {
  station: Station | null
}

export class UpdateStationUseCase {
  constructor(private stationService: StationService) {}

  async execute(request: UpdateStationRequest): Promise<UpdateStationResponse> {
    const station = await this.stationService.update(request)
    return { station }
  }
}
