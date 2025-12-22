import { GenerationEvent, GenerationPass, PassContext, PassType } from "../stream-post-generationn";
import { GenerationSession } from "@/core/application/usecases/marketing/post/generate-post/post-gen-service.interfaces";

export class DraftStreamingPass implements GenerationPass {
    readonly name: PassType = 'draft';

    private buildPrompt(ctx: PassContext, session?: GenerationSession): string {
        const { body, brand, product } = ctx;

        // Brand info
        const brandInfo = brand ? [
            brand.brandDescription && `Brand Overview: ${brand.brandDescription}`,
            brand.brandVoice && `Brand Voice: ${JSON.stringify(brand.brandVoice)}`,
            brand.contentStyle && `Content Style: ${brand.contentStyle}`,
            brand.language && `Language: ${brand.language}`,
            brand.keyPoints?.length ? `Key Points:\n- ${brand.keyPoints.join("\n- ")}` : '',
            brand.ctaLibrary?.length ? `CTA Library:\n- ${brand.ctaLibrary.join("\n- ")}` : '',
        ].filter(Boolean).join("\n") : '';

        // Product info
        const productInfo = product ? [
            product.name ? `- Name: ${product.name}` : '',
            product.detail ? `- Details: ${product.detail}` : '',
            product.url ? `- URL: ${product.url}` : ''
        ].filter(Boolean).join("\n") : '';

        return `
            You are writing the FULL DRAFT of a social media post body.

            Your goal is to deliver value-first content that feels natural, human, and non-promotional.

            ${body ? `Initial reference content (optional, do not copy directly):\n${body}` : ''}

            ${brandInfo ? `Brand context:\n${brandInfo}` : ''}

            ${session?.outlinePass?.outline ? `Content structure to follow:\n${session.outlinePass.outline}` : ''}

            ${productInfo ? `
            Product reference (for contextual inspiration only):
            ${productInfo}

            Guidelines for product mention:
            - The product is NOT the main subject of the post
            - Mention it only if it naturally supports the message
            - Integrate it subtly through examples, scenarios, or personal experience
            - Avoid sales language, pricing, or hard promotion
            ` : ''}

            Writing guidelines:
            - Write in a natural, conversational tone
            - Focus on audience insight, experience, or practical value
            - Follow the outline, but do not explicitly label sections
            - Allow the content to flow as a single cohesive post
            - End with a soft, optional call-to-action (curiosity-driven or reflective)
            - Add/Change suitable emojis

            Output rules:
            - Return ONLY plain text of post body, no title
            - No markdown
            - No explanations or meta commentary
            `.trim();

    }

    async *execute(ctx: PassContext,): AsyncGenerator<GenerationEvent> {
        const { idea, brand, product, sessionId, hasChange } = ctx
        const session = await ctx.cache.get<GenerationSession>(sessionId)
        console.log("session", session);

        const canSkip = (!idea || (session?.draftPass && !hasChange))
        if (canSkip) {
            yield { type: "pass:skip", pass: "draft" }
            return
        }
        yield { type: 'pass:start', pass: this.name };

        const prompt = this.buildPrompt(ctx, session);
        console.log("prompt", prompt);


        let buffer = '';
        for await (const token of ctx.llm.generateStreamingCompletion({
            systemPrompt: "You are a professional content writer. Always respond with valid string only. Never use markdown code blocks.",
            prompt,
            temperature: 0.7,
            maxTokens: 1500,
        })) {
            buffer += token;
            yield { type: 'body:token', pass: "draft", content: token };
        }

        // Chỉ lưu content body vào session
        await ctx.cache.updateSession(ctx.sessionId, {
            draftPass: {
                draft: buffer,
            },
        });

        yield { type: 'pass:complete', pass: this.name };
    }
}
