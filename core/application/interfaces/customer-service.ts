import type { Customer } from "@/core/domain/managements/customer"

export interface CustomerPayload extends Partial<Customer> { }


export interface CustomerService {
  getAll(): Promise<Customer[]>
  getById(id: string): Promise<Customer | null>
  create(payload: CustomerPayload): Promise<Customer>
  update(payload: CustomerPayload): Promise<Customer | null>
  delete(id: string): Promise<boolean>
  searchByName(name: string): Promise<Customer[]>
}
