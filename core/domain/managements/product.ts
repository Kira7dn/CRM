export interface SizeOption {
  label: string;
  price: number;
  originalPrice?: number;
  cost?: number;
}

export class Product {
  constructor(
    public readonly id: number,
    public categoryId: number,
    public name: string,
    public price: number,
    public originalPrice: number | undefined,
    public cost: number | undefined,
    public image: string | undefined,
    public detail: string | undefined,
    public sizes: SizeOption[] | undefined,
    public colors: string[] | undefined,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // Calculate profit margin as percentage
  getMargin(): number {
    if (!this.cost || this.cost === 0) return 0;
    return ((this.price - this.cost) / this.price) * 100;
  }

  // Calculate gross profit
  getProfit(): number {
    if (!this.cost) return 0;
    return this.price - this.cost;
  }
}
