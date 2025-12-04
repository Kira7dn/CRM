import { GeneratePostContentUseCase } from "@/core/application/usecases/marketing/post/generate-post-content"
import { GeneratePostMultiPassUseCase } from "@/core/application/usecases/marketing/post/generate-post-multi-pass"
import { ResearchTopicUseCase } from "@/core/application/usecases/marketing/post/research-topic"
import { RetrieveKnowledgeUseCase } from "@/core/application/usecases/marketing/post/retrieve-knowledge"

export const createGeneratePostContentUseCase = async () => {
  return new GeneratePostContentUseCase()
}

export const createGeneratePostMultiPassUseCase = async () => {
  return new GeneratePostMultiPassUseCase()
}

export const createResearchTopicUseCase = async () => {
  return new ResearchTopicUseCase()
}

export const createRetrieveKnowledgeUseCase = async () => {
  return new RetrieveKnowledgeUseCase()
}
