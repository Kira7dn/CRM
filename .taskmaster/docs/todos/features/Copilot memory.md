# Cấu trúc + mã (TypeScript) để triển khai **Copilot Memory System** (ChatGPT-style) — sẵn tích hợp với CopilotKit

Dưới đây là **một bản thiết kế thực tế + code skeleton** (các file TypeScript) để bạn copy/paste vào dự án Next.js/Node của mình. Nó bao gồm:

* Cấu trúc thư mục đề xuất
* Các interface/type cho 4 loại memory (User, Project, Knowledge, Episodic)
* **Copilot-side**: context hook, tools (searchKnowledge, saveMemory), episodic state hook, content agent multi-pass skeleton (idea → research → draft → save)
* **Server-side** API skeletons (Next.js API route handlers) để gọi DB/VectorDB (MongoDB + Qdrant) — nội dung có comment để bạn nối vào implementation thực tế
* Ví dụ prompt template & tool contract

> Ghi chú: mã là **skeleton production-ready** có types, kiểu trả về, validation (zod) và comments. Bạn thay connection strings, client libs (qdrant/pinecone SDK) theo môi trường.

---

# 1) Cấu trúc thư mục đề xuất

```
/src
  /copilot
    context.ts
    hooks/
      useEpisodicMemory.ts
    tools/
      searchKnowledge.ts
      saveMemory.ts
      getUserPreferences.ts
    agents/
      contentAgent.ts
    prompts/
      templates.ts
  /server
    /api
      memory/
        search.ts
        save.ts
        getUserPrefs.ts
    services/
      mongoClient.ts
      qdrantClient.ts
      memoryService.ts
  /types
    memory.ts
  /config
    rubric.json
  app/
    (Copilot UI pages / components)
```

---

# 2) Types & Interfaces (src/types/memory.ts)

```ts
// src/types/memory.ts
export type ID = string;

export interface UserPreferenceMemory {
  userId: ID;
  preferredLanguage?: string; // "vi" | "en"
  preferredTone?: "formal" | "informal" | "concise" | "detailed";
  avoidTopics?: string[];
  favoriteFormats?: string[]; // e.g. ["bullet", "story"]
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectMemory {
  projectId: ID;
  title: string;
  summary?: string;
  decisions?: Array<{ key: string; value: string; createdAt: string }>;
  artifacts?: Array<{ id: ID; title: string; type: string }>;
  createdAt: string;
  updatedAt?: string;
}

export interface KnowledgeChunk {
  id: ID;
  text: string;
  source?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface EpisodicMemory {
  sessionId: ID;
  userId: ID;
  recentSummaries?: string[]; // short summaries
  currentTask?: {
    taskId?: string;
    description?: string;
    state?: Record<string, any>;
  };
  transient?: Record<string, any>;
  updatedAt?: string;
}
```

---

# 3) Copilot Context + Episodic Hook (client side)

### 3.1 `src/copilot/context.ts` — inject structured memory on session init

```ts
// src/copilot/context.ts
import { useEffect } from "react";
import { useCopilotContext } from "copilotkit"; // pseudo import: replace with actual
import { UserPreferenceMemory } from "../types/memory";

export async function initCopilotContext(userId: string, projectId?: string) {
  const { setContext } = useCopilotContext();

  // Fetch structured user preferences & project memory from server
  const [prefsRes, projectRes] = await Promise.all([
    fetch(`/api/memory/getUserPrefs?userId=${userId}`).then(r => r.json()),
    projectId ? fetch(`/api/memory/getProject?projectId=${projectId}`).then(r => r.json()) : Promise.resolve(null)
  ]);

  setContext({
    metadata: {
      userPreferences: prefsRes as UserPreferenceMemory,
      projectMemory: projectRes || null,
      memoryCapabilities: {
        structured: true,
        semantic: true,
        episodic: true
      }
    },
    defaultSystemMessage: `You are a helpful Copilot. Respect user preferences and project context in metadata.`
  });
}
```

> Replace `useCopilotContext` import with actual CopilotKit API in your repo. The idea: load structured memory and put into Copilot context metadata.

---

### 3.2 `src/copilot/hooks/useEpisodicMemory.ts` — store ephemeral session state

```ts
// src/copilot/hooks/useEpisodicMemory.ts
import { useCopilotState } from "copilotkit"; // pseudo import
import type { EpisodicMemory } from "../../types/memory";

export function useEpisodicMemory(sessionId: string, initial?: Partial<EpisodicMemory>) {
  const [state, setState] = useCopilotState<EpisodicMemory>(`episodic:${sessionId}`, {
    sessionId,
    userId: "",
    recentSummaries: [],
    transient: {},
    ...initial,
  });

  function update(partial: Partial<EpisodicMemory>) {
    setState(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }));
  }

  function clear() {
    setState({ sessionId, userId: "", recentSummaries: [], transient: {}, updatedAt: new Date().toISOString() });
  }

  return { state, update, clear };
}
```

`useCopilotState` is the CopilotKit state hook that persists state for the agent session. If your CopilotKit doesn't have it, store in client state (React) or via backend (Redis) for multi-instance.

---

# 4) Copilot Tools (client side) — tools call server APIs

### 4.1 `src/copilot/tools/searchKnowledge.ts`

```ts
// src/copilot/tools/searchKnowledge.ts
import { z } from "zod";
import { copilotTool } from "copilotkit"; // pseudo

const SearchParams = z.object({
  query: z.string(),
  topK: z.number().optional(),
  projectId: z.string().optional(), // scope
});

export const searchKnowledge = copilotTool({
  name: "searchKnowledge",
  description: "Search long-term knowledge (semantic) memory; returns top chunks.",
  parametersSchema: SearchParams,
  async execute(params) {
    const validated = SearchParams.parse(params);
    const res = await fetch("/api/memory/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    }).then(r => r.json());
    return res; // should be array of {id, score, text, metadata}
  }
});
```

### 4.2 `src/copilot/tools/saveMemory.ts`

```ts
// src/copilot/tools/saveMemory.ts
import { z } from "zod";
import { copilotTool } from "copilotkit";

const SaveSchema = z.object({
  kind: z.enum(["userPreference", "project", "knowledgeChunk", "episodicSummary"]),
  payload: z.any(),
});

export const saveMemory = copilotTool({
  name: "saveMemory",
  description: "Persist a memory item to server (user prefs / project / knowledge chunk / episodic summary).",
  parametersSchema: SaveSchema,
  async execute(params) {
    const validated = SaveSchema.parse(params);
    const res = await fetch("/api/memory/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    }).then(r => r.json());
    return res;
  }
});
```

### 4.3 `src/copilot/tools/getUserPreferences.ts` (reads metadata fallback)

```ts
// src/copilot/tools/getUserPreferences.ts
import { copilotTool } from "copilotkit";

export const getUserPreferences = copilotTool({
  name: "getUserPreferences",
  description: "Return user preference memory from Copilot context metadata.",
  parametersSchema: {},
  execute: async (_, context) => {
    // context.metadata available depending on CopilotKit
    return context?.metadata?.userPreferences ?? null;
  },
});
```

> Tools are registered to the CopilotKit agent runtime so that the LLM can call them as actions. When using tool-calls, ensure your system prompts instruct model to use tools for fact lookup and saving.

---

# 5) Copilot Agent (multi-pass) — `src/copilot/agents/contentAgent.ts`

This is sample of a general-purpose multi-pass agent that uses memory tools. You can adapt to any task.

```ts
// src/copilot/agents/contentAgent.ts
import { searchKnowledge, saveMemory, getUserPreferences } from "../tools";
import { useCopilotLLM } from "copilotkit"; // pseudo
import { useEpisodicMemory } from "../hooks/useEpisodicMemory";

export async function runGeneralAgent({ sessionId, userId, userInput }: {
  sessionId: string;
  userId: string;
  userInput: string;
}) {
  // get ephemeral state
  const episodic = useEpisodicMemory(sessionId);

  // 1) Idea / Intent detection
  const ideaPrompt = `
You are an assistant. The user input: "${userInput}".
Check user preferences (call getUserPreferences tool) for formatting.
Return 3 concise candidate intents or tasks (JSON).
`;
  const llm = useCopilotLLM(); // wrapper to call LLM via CopilotKit

  const ideaResp = await llm.complete({
    system: ideaPrompt,
    tools: { getUserPreferences }
  });

  const candidateIntents = parseLLMJson(ideaResp);

  episodic.update({ transient: { candidateIntents } });

  // 2) Research pass (call semantic memory)
  const primaryIntent = candidateIntents[0];
  const research = await searchKnowledge.execute({ query: primaryIntent.summary, topK: 6 });
  episodic.update({ transient: { research } });

  // 3) Draft pass (use research + user prefs)
  const draftPrompt = `
You are a helpful assistant. Use the research provided, respect user preferences.
Research: ${JSON.stringify(research)}
User input: ${userInput}
Produce answer/draft. Return JSON { draft: "...", sources: [...] }
`;
  const draftResp = await llm.complete({
    system: draftPrompt,
    tools: { getUserPreferences }
  });

  const draftJson = parseLLMJson(draftResp);
  episodic.update({ transient: { draft: draftJson.draft } });

  // 4) Scoring / Self-review
  const scoringPrompt = `
Review the draft and score on: correctness, clarity, brevity. Return JSON.
Draft: ${JSON.stringify(draftJson.draft)}
`;
  const scoreResp = await llm.complete({ system: scoringPrompt });
  const score = parseLLMJson(scoreResp);

  if (score.overall < 7) {
    // rewrite if low score
    const rewriteResp = await llm.complete({
      system: `Revise the draft to improve based on score feedback: ${JSON.stringify(score)}.`,
      tools: { getUserPreferences }
    });
    const revised = parseLLMJson(rewriteResp).draft;
    episodic.update({ transient: { draft: revised } });
  }

  // 5) Persist knowledge (if flagged to save)
  await saveMemory.execute({
    kind: "knowledgeChunk",
    payload: {
      text: draftJson.draft,
      source: "copilot:generated",
      metadata: { userId, sessionId, createdAt: new Date().toISOString() }
    }
  });

  // update episodic summaries list
  episodic.update({
    recentSummaries: [...(episodic.state.recentSummaries ?? []), summariseText(draftJson.draft)].slice(-10)
  });

  return { draft: draftJson.draft, score };
}

// Helpers
function parseLLMJson(resp: any) {
  try {
    return JSON.parse(resp.content ?? resp);
  } catch (e) {
    // fallback simple parse or throw
    throw new Error("LLM response not valid JSON");
  }
}

function summariseText(text: string) {
  return text.slice(0, 180);
}
```

> `useCopilotLLM` and the `copilotTool.execute` invocations are placeholders to show integration points. Adapt to your CopilotKit APIs.

---

# 6) Server API skeletons (Next.js API routes) — `src/server/api/memory/*`

> These endpoints are called by Copilot tools. You implement storage behavior here.

### 6.1 `/api/memory/search` — semantic search

```ts
// src/server/api/memory/search.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { qdrantClient } from "../../services/qdrantClient";
import { embedText } from "../../services/embeddings";

const Input = z.object({
  query: z.string(),
  topK: z.number().optional(),
  projectId: z.string().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.method === "POST" ? req.body : req.query;
    const params = Input.parse(body);
    const embedding = await embedText(params.query);
    // call vector DB
    const results = await qdrantClient.search({
      collection: params.projectId ? `knowledge_${params.projectId}` : "knowledge_global",
      vector: embedding,
      topK: params.topK ?? 6
    });
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
}
```

### 6.2 `/api/memory/save` — save memory item

```ts
// src/server/api/memory/save.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { mongoClient } from "../../services/mongoClient";
import { embedText } from "../../services/embeddings";
import { qdrantClient } from "../../services/qdrantClient";

const SaveSchema = z.object({
  kind: z.enum(["userPreference", "project", "knowledgeChunk", "episodicSummary"]),
  payload: z.any()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = SaveSchema.parse(req.body);
    const { kind, payload } = body;

    switch (kind) {
      case "userPreference":
        await mongoClient.collection("user_preferences").updateOne(
          { userId: payload.userId },
          { $set: { ...payload, updatedAt: new Date() } },
          { upsert: true }
        );
        return res.status(200).json({ ok: true });

      case "project":
        await mongoClient.collection("projects").updateOne(
          { projectId: payload.projectId },
          { $set: { ...payload, updatedAt: new Date() } },
          { upsert: true }
        );
        return res.status(200).json({ ok: true });

      case "knowledgeChunk":
        // save text to mongo + embed -> qdrant
        const doc = {
          text: payload.text,
          source: payload.source,
          metadata: payload.metadata ?? {},
          createdAt: new Date()
        };
        const insert = await mongoClient.collection("knowledge_chunks").insertOne(doc);
        const embedding = await embedText(payload.text);
        await qdrantClient.upsert({
          collection: "knowledge_global",
          id: insert.insertedId.toString(),
          vector: embedding,
          payload: { text: payload.text, source: payload.source, metadata: payload.metadata }
        });
        return res.status(200).json({ ok: true, id: insert.insertedId });

      case "episodicSummary":
        await mongoClient.collection("episodic").insertOne({
          ...payload,
          createdAt: new Date()
        });
        return res.status(200).json({ ok: true });

      default:
        return res.status(400).json({ error: "Unsupported kind" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
```

> `mongoClient`, `qdrantClient`, `embedText` are service wrappers shown next.

---

# 7) Server service wrappers (skeletons)

### 7.1 `src/server/services/mongoClient.ts`

```ts
// src/server/services/mongoClient.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI not set");

const client = new MongoClient(uri);
await client.connect();

export const mongoClient = client.db(process.env.MONGODB_DB || "crm_db");
```

### 7.2 `src/server/services/qdrantClient.ts` (pseudo wrapper)

```ts
// src/server/services/qdrantClient.ts
// Use actual qdrant client from sdk in real implementation
export const qdrantClient = {
  async search({ collection, vector, topK = 6 }: { collection: string; vector: number[]; topK?: number }) {
    // TODO: call qdrant client
    // return array of { id, score, payload: { text, metadata } }
    return [];
  },
  async upsert({ collection, id, vector, payload }: { collection: string; id: string; vector: number[]; payload: any }) {
    // TODO: call qdrant upsert
    return { ok: true };
  }
};
```

### 7.3 `src/server/services/embeddings.ts`

```ts
// src/server/services/embeddings.ts
export async function embedText(text: string): Promise<number[]> {
  // TODO: call OpenAI embeddings (text-embedding-3-large) or your embedding model
  // e.g. const res = await openai.embeddings.create({ model: "text-embedding-3-large", input: text });
  // return res.data[0].embedding;
  return new Array(1536).fill(0); // placeholder
}
```

---

# 8) Prompts & Tool Contracts (templates)

### 8.1 Tool contract: `searchKnowledge`

Input:

```json
{ "query": "how to cook squid", "topK": 6, "projectId": "proj_123" }
```

Output:

```json
[
  { "id":"...", "score": 0.93, "payload": { "text": "...", "source":"knowledge_chunks", "metadata": {...} } },
  ...
]
```

### 8.2 Prompt template (research summarizer)

```ts
// src/copilot/prompts/templates.ts
export const researchSummarizerPrompt = (chunks: any[]) => `
You are ResearchAgent. Given the following document snippets, extract:
- keyFacts: 3-6 short facts
- mainStories: up to 2 short story sentences
- questionsToVerify: up to 3 claims that need validation
- sources: array of source ids/titles

Snippets:
${JSON.stringify(chunks, null, 2)}

Return ONLY JSON in this schema:
{ "keyFacts": [...], "mainStories": [...], "questionsToVerify":[...], "sources":[{id,title}] }
`;
```

---