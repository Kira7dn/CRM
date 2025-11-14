import type { CustomerService } from "@/core/application/interfaces/customer-service"

export interface DeleteCustomerRequest {
  id: string
}

export interface DeleteCustomerResponse {
  success: boolean
}

export class DeleteCustomerUseCase {
  constructor(private customerService: CustomerService) {}

  async execute(request: DeleteCustomerRequest): Promise<DeleteCustomerResponse> {
    const success = await this.customerService.delete(request.id)
    return { success }
  }
}
