/**
 * Research Pass
 * External knowledge gathering & synthesis
 */
import { PerplexityService } from "@/core/application/usecases/marketing/post/generate-post/perplexity.service"
import { GenerationSession } from "@/core/application/usecases/marketing/post/generate-post/post-gen-service.interfaces"
import { ResearchTopicUseCase } from "../research-topic"
import { GenerationEvent, GenerationPass, PassContext, PassType } from "../stream-post-generationn"

export class ResearchPass implements GenerationPass {
  readonly name: PassType = 'research'


  async *execute(ctx: PassContext): AsyncGenerator<GenerationEvent> {
    const { idea, product, brand, contentType, sessionId, hasChange } = ctx
    const session = await ctx.cache.get<GenerationSession>(sessionId)
    const canSkip = (!idea || (session?.researchPass && !hasChange))
    if (canSkip) {
      yield { type: 'pass:skip', pass: 'research' }
      return
    }

    yield { type: 'pass:start', pass: 'research' }

    try {
      const perplexityService = new PerplexityService()
      const researchUseCase = new ResearchTopicUseCase(
        ctx.llm,
        perplexityService
      )

      const research = await researchUseCase.execute({
        topic: idea,
        contentType,
        product,
        brand
      })

      const updateData: any = {
        researchPass: {
          insights: research.insights,
          risks: research.risks,
          recommendedAngles: research.recommendedAngles,
          sources: research.sources,
        }
      }

      await ctx.cache.updateSession(sessionId, updateData)

      console.log(
        `[ResearchPass] Completed with ${research.insights.length} insights`
      )
    } catch (error) {
      console.warn('[ResearchPass] Failed, fallback to empty research', error)
    }

    yield { type: 'pass:complete', pass: 'research' }
  }
}
