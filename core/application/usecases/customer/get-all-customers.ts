import type { Customer } from "@/core/domain/managements/customer"
import type { CustomerService } from "@/core/application/interfaces/customer-service"

export interface GetAllCustomersRequest { }

export interface GetAllCustomersResponse {
  customers: Customer[]
}

export class GetAllCustomersUseCase {
  constructor(private customerService: CustomerService) { }

  async execute(request: GetAllCustomersRequest): Promise<GetAllCustomersResponse> {
    const customers = await this.customerService.getAll()
    return { customers }
  }
}
