import { GenerationSession } from "@/core/application/usecases/marketing/post/generate-post/post-gen-service.interfaces";
import { GenerationEvent, GenerationPass, PassContext, PassType } from "../stream-post-generationn";

export class EnhanceStreamingPass implements GenerationPass {
    readonly name: PassType = 'enhance';

    private buildPrompt(ctx: PassContext, session?: GenerationSession): string {
        const { body, brand, product, contentInstruction } = ctx

        const brandInfo = brand ? [
            brand.brandVoice && `Brand Voice: ${JSON.stringify(brand.brandVoice)}`,
            brand.keyPoints?.length
                ? `Key Points:\n- ${brand.keyPoints.join("\n- ")}`
                : "",
        ].filter(Boolean).join("\n") : ""
        // Product info
        const productInfo = product ? [
            product.name ? `- Name: ${product.name}` : '',
            product.detail ? `- Details: ${product.detail}` : '',
            product.url ? `- URL: ${product.url}` : ''
        ].filter(Boolean).join("\n") : '';
        const initialContent = session?.draftPass?.draft || body || ""

        const userInstructionBlock = contentInstruction
            ? `User instruction (highest priority):${contentInstruction}`
            : ""

        return `
            You are enhancing an EXISTING draft.

            ${userInstructionBlock}

            Original draft:
            ${initialContent}

            ${brandInfo ? `Brand alignment:\n${brandInfo}` : ""}
            ${productInfo ? `Product alignment:\n${productInfo}` : ""}

            Enhancement guidelines:
            - Improve clarity, flow, and readability
            - Make the content sound more natural and human
            - Refine wording for better engagement WITHOUT changing meaning
            - Adjust the call-to-action only if it improves clarity or matches the user intent
            - Add/Change suitable emojis

            Product handling:
            - ONLY refine product mentions if they already exist
            - Do NOT introduce new product references unless explicitly instructed

            Strict boundaries:
            - Do NOT rewrite from scratch
            - Do NOT introduce new ideas, claims, or angles
            - Do NOT significantly change content length
            - Avoid sales language unless explicitly requested

            Output rules:
            - Return ONLY the enhanced content
            - Plain text only
            - No markdown or meta commentary
            `.trim()
    }


    async *execute(ctx: PassContext): AsyncGenerator<GenerationEvent> {
        const session = await ctx.cache.get<GenerationSession>(ctx.sessionId)
        yield { type: 'pass:start', pass: this.name };

        const prompt = this.buildPrompt(ctx, session);
        console.log(prompt);

        let buffer = '';
        for await (const token of ctx.llm.generateStreamingCompletion({
            systemPrompt: "You are an expert content editor. Always respond with valid string only. Never use markdown code blocks.",
            prompt,
            temperature: 0.6,
            maxTokens: 1500,
        })) {
            buffer += token;
            yield { type: 'body:token', pass: "enhance", content: token };
        }
        const enhancedData = {
            enhanced: buffer,
        }

        await ctx.cache.updateSession(ctx.sessionId, { enhancePass: enhancedData });

        yield { type: 'pass:complete', pass: this.name };
    }
}
