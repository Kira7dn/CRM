// app/api/queues/scheduled-post/route.ts
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { publishPostUseCase } from "../depends"
import { NextRequest, NextResponse } from "next/server"

interface PublishScheduledPostPayload {
    postId: string
    userId: string
}

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
    const body = await req.json()
    console.log(body);
    const {
        type,
        payload,
    }: {
        type?: string
        payload?: PublishScheduledPostPayload
    } = body ?? {}

    // 1️⃣ Validate event type
    if (type !== "publish-scheduled-post") {
        return NextResponse.json({ ignored: true })
    }

    if (!payload?.postId || !payload?.userId) {
        console.warn("[ScheduledPostRoute] Invalid payload:", payload)
        return NextResponse.json(
            { error: "Invalid payload" },
            { status: 400 }
        )
    }

    // 2️⃣ Resolve use case from DI
    const useCase = await publishPostUseCase()

    // 3️⃣ Execute publish (idempotent inside usecase)
    await useCase.execute(payload.postId, payload.userId)

    return NextResponse.json({ ok: true })
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{}> }
) {
    try {
        return NextResponse.json("12121");
    } catch (error) {
        return NextResponse.json({ message: "Error fetching product" }, { status: 500 });
    }
}