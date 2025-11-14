export class Category {
  constructor(
    public readonly id: number,
    public name: string,
    public image: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
