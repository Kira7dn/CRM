export class Post {
  constructor(
    public readonly id: string,
    public title: string,
    public body: string | undefined,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
