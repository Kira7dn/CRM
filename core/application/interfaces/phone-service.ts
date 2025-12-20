export interface PhoneService {
  decodePhone(token: string, accessToken: string): Promise<string>;
}
