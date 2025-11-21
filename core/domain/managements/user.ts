export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public avatar: string,
    public phone: string,
    public email: string,
    public address: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
