export interface LocationService {
  decodeLocation(token: string, accessToken: string): Promise<{
    location: { lat: number; lng: number };
    address: string | null;
  }>;
}
