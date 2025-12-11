import { NextRequest, NextResponse } from "next/server";
import { publishWordPressPostUseCase } from "./depends";

/**
 * POST /api/social/wordpress/publish
 * Publish a post to WordPress
 * Body:
 *   - userId: User ID
 *   - post: Post data (title, content, status, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, post } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!post || !post.title || !post.content) {
      return NextResponse.json(
        { error: "Post title and content are required" },
        { status: 400 }
      );
    }

    const useCase = await publishWordPressPostUseCase();
    const result = await useCase.execute({ userId, post });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[WordPress Publish API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to publish post to WordPress" },
      { status: 500 }
    );
  }
}
