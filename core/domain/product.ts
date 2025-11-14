export interface SizeOption {
  label: string;
  price: number;
  originalPrice?: number;
}

export class Product {
  constructor(
    public readonly id: number,
    public categoryId: number,
    public name: string,
    public price: number,
    public originalPrice: number | undefined,
    public image: string | undefined,
    public detail: string | undefined,
    public sizes: SizeOption[] | undefined,
    public colors: string[] | undefined,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
