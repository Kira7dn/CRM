import type { Customer } from "@/core/domain/managements/customer"
import type { CustomerService, CustomerPayload } from "@/core/application/interfaces/customer-service"

export interface UpdateCustomerRequest extends CustomerPayload { }

export interface UpdateCustomerResponse {
  customer: Customer | null
}

export class UpdateCustomerUseCase {
  constructor(private customerService: CustomerService) { }

  async execute(request: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    const customer = await this.customerService.update(request)
    return { customer }
  }
}
