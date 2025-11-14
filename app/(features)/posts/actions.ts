"use server"

import { revalidatePath } from "next/cache"
import { createPostUseCase } from "@/core/application/usecases/post/create-post"
import { deletePostUseCase } from "@/core/application/usecases/post/delete-post"
import { updatePostUseCase } from "@/core/application/usecases/post/update-post"

export async function createPostAction(formData: FormData) {
  const title = formData.get("title")?.toString() || ""
  const body = formData.get("body")?.toString() || ""
  const now = new Date()
  await createPostUseCase({ title, body, createdAt: now, updatedAt: now })
  revalidatePath("/posts")
}

export async function deletePostAction(id: string) {
  await deletePostUseCase(id)
  revalidatePath("/posts")
}

export async function updatePostAction(id: string, formData: FormData) {
  const title = formData.get("title")?.toString()
  const body = formData.get("body")?.toString()
  const now = new Date()
  await updatePostUseCase(id, { title, body, updatedAt: now })
  revalidatePath("/posts")
}
