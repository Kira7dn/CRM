import type { Customer } from "@/core/domain/customers/customer"
import type { CustomerService, CustomerPayload } from "@/core/application/interfaces/customer-service"
import { validateCustomer } from "@/core/domain/customers/customer"

export interface CreateCustomerRequest extends CustomerPayload { }

export interface CreateCustomerResponse {
  customer: Customer
}

export class CreateCustomerUseCase {
  constructor(private customerService: CustomerService) { }

  async execute(request: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    // Validate customer data
    const errors = validateCustomer(request)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const customer = await this.customerService.create(request)
    return { customer }
  }
}
