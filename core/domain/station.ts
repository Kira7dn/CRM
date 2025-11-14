export interface Location {
  lat: number;
  lng: number;
}

export class Station {
  constructor(
    public readonly id: number,
    public name: string,
    public image: string | undefined,
    public address: string,
    public location: Location,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
