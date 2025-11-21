"use server"

import { revalidatePath } from "next/cache"
import {
  getAllCustomersUseCase,
  createCustomerUseCase,
  updateCustomerUseCase,
  deleteCustomerUseCase,
  searchCustomersByNameUseCase,
} from "@/app/api/customers/depends"

export async function getCustomersAction(searchQuery?: string) {
  if (searchQuery) {
    const useCase = await searchCustomersByNameUseCase()
    const result = await useCase.execute({ name: searchQuery })
    return result.customers
  } else {
    const useCase = await getAllCustomersUseCase()
    const result = await useCase.execute({})
    return result.customers
  }
}

export async function createCustomerAction(formData: FormData) {
  const useCase = await createCustomerUseCase()

  const primarySource = formData.get("foundation")?.toString() || "zalo"
  const platformUserId = formData.get("id")?.toString() || ""

  await useCase.execute({
    id: platformUserId,
    name: formData.get("name")?.toString(),
    phone: formData.get("phone")?.toString(),
    email: formData.get("email")?.toString(),
    primarySource: primarySource as any,
    platformIds: [
      {
        platform: primarySource as any,
        platformUserId: platformUserId,
      },
    ],
    address: formData.get("address")?.toString(),
    avatar: formData.get("avatar")?.toString(),
  })

  revalidatePath("/customers")
}

export async function updateCustomerAction(formData: FormData) {
  const useCase = await updateCustomerUseCase()

  const primarySource = formData.get("foundation")?.toString()
  const platformUserId = formData.get("id")?.toString() || ""

  const payload: any = {
    id: platformUserId,
    name: formData.get("name")?.toString(),
    phone: formData.get("phone")?.toString(),
    email: formData.get("email")?.toString(),
    address: formData.get("address")?.toString(),
    avatar: formData.get("avatar")?.toString(),
  }

  if (primarySource) {
    payload.primarySource = primarySource
    payload.platformIds = [
      {
        platform: primarySource,
        platformUserId: platformUserId,
      },
    ]
  }

  await useCase.execute(payload)

  revalidatePath("/customers")
}

export async function deleteCustomerAction(id: string) {
  const useCase = await deleteCustomerUseCase()
  await useCase.execute({ id })
  revalidatePath("/customers")
}
