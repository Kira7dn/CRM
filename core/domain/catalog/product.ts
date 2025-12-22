export interface SizeOption {
  label: string;
  price: number;
  originalPrice?: number;
}

// export interface ProductPlain {
//   id: string;
//   categoryId: number;
//   name: string;
//   price: number;
//   originalPrice?: number;
//   image?: string;
//   detail?: string;
//   sizes?: SizeOption[];
//   colors?: string[];
//   url?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export class Product {
  constructor(
    public readonly id: string,
    public categoryId: number,
    public name: string,
    public price: number,
    public originalPrice: number | undefined,
    public image: string | undefined,
    public detail: string | undefined,
    public sizes: SizeOption[] | undefined,
    public colors: string[] | undefined,
    public url: string | undefined,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) { }

  // Convert class instance to plain object
  // toPlain(): ProductPlain {
  //   return {
  //     id: this.id,
  //     categoryId: this.categoryId,
  //     name: this.name,
  //     price: this.price,
  //     originalPrice: this.originalPrice,
  //     image: this.image,
  //     detail: this.detail,
  //     sizes: this.sizes,
  //     colors: this.colors,
  //     url: this.url,
  //     createdAt: this.createdAt,
  //     updatedAt: this.updatedAt,
  //   };
  // }

  // Convert plain object to class instance
  // static fromPlain(plain: ProductPlain): Product {
  //   return new Product(
  //     plain.id,
  //     plain.categoryId,
  //     plain.name,
  //     plain.price,
  //     plain.originalPrice,
  //     plain.image,
  //     plain.detail,
  //     plain.sizes,
  //     plain.colors,
  //     plain.url,
  //     plain.createdAt,
  //     plain.updatedAt
  //   );
  // }
}
