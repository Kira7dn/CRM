import type { Customer } from "@/core/domain/customers/customer"
import type { CustomerService } from "@/core/application/interfaces/customers/customer-service"

export interface GetCustomerByIdRequest {
  id: string
}

export interface GetCustomerByIdResponse {
  customer: Customer | null
}

export class GetCustomerByIdUseCase {
  constructor(private customerService: CustomerService) { }

  async execute(request: GetCustomerByIdRequest): Promise<GetCustomerByIdResponse> {
    const customer = await this.customerService.getById(request.id)
    return { customer }
  }
}
