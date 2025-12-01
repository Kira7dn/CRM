import type { Customer } from "@/core/domain/customers/customer"
import type { CustomerService } from "@/core/application/interfaces/customers/customer-service"

export interface SearchCustomersByNameRequest {
  name: string
}

export interface SearchCustomersByNameResponse {
  customers: Customer[]
}

export class SearchCustomersByNameUseCase {
  constructor(private customerService: CustomerService) { }

  async execute(request: SearchCustomersByNameRequest): Promise<SearchCustomersByNameResponse> {
    const customers = await this.customerService.searchByName(request.name)
    return { customers }
  }
}
