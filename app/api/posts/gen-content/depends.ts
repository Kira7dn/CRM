import { LLMService } from "@/infrastructure/adapters/llm-service"
import { PerplexityService as PerplexityServiceImpl } from "@/core/application/usecases/marketing/post/generate-post/perplexity.service"

import type { ILLMService } from "@/core/application/usecases/marketing/post/generate-post/post-gen-service.interfaces"
import type { ICacheService } from "@/core/application/usecases/marketing/post/generate-post/post-gen-service.interfaces"
import { StreamPostUseCase } from "@/core/application/usecases/marketing/post/generate-post/stream-post-generationn"
import { PerplexityService, ResearchTopicUseCase } from "@/core/application/usecases/marketing/post/generate-post/research-topic"
import { RedisCacheService } from "@/core/application/usecases/marketing/post/generate-post/redis-cache.service"

/**
 * ======================================================
 * Singleton Instances
 * ======================================================
 */
let llmServiceInstance: ILLMService | null = null
let cacheServiceInstance: ICacheService | null = null
let streamMultiPassUseCaseInstance: StreamPostUseCase | null = null
let perplexityServiceInstance: PerplexityService | null = null
let researchTopicUseCaseInstance: ResearchTopicUseCase | null = null

/**
 * ======================================================
 * Services
 * ======================================================
 */
export const getLLMService = (): ILLMService => {
    if (!llmServiceInstance) {
        llmServiceInstance = new LLMService()
    }
    return llmServiceInstance
}

const getCacheService = (): ICacheService => {
    if (!cacheServiceInstance) {
        cacheServiceInstance = new RedisCacheService()
    }
    return cacheServiceInstance
}

const getPerplexityService = (): PerplexityService => {
    if (!perplexityServiceInstance) {
        perplexityServiceInstance = new PerplexityServiceImpl()
    }
    return perplexityServiceInstance
}

/**
 * ======================================================
 * UseCases
 * ======================================================
 */
export const createStreamMultiPassUseCase = async (): Promise<StreamPostUseCase> => {
    if (!streamMultiPassUseCaseInstance) {
        const llmService = getLLMService()
        const cacheService = getCacheService()

        streamMultiPassUseCaseInstance = new StreamPostUseCase(
            llmService,
            cacheService,
        )
    }
    return streamMultiPassUseCaseInstance
}


export const createResearchTopicUseCase = async (): Promise<ResearchTopicUseCase> => {
    if (!researchTopicUseCaseInstance) {
        const llmService = getLLMService()
        const perplexityService = getPerplexityService()

        researchTopicUseCaseInstance = new ResearchTopicUseCase(
            llmService,
            perplexityService
        )
    }
    return researchTopicUseCaseInstance
}