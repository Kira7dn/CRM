/**
 * Document Chunker Utility
 * Splits text into overlapping chunks for vector embedding
 */

export interface ChunkOptions {
  chunkSize: number
  overlap: number
}

/**
 * DocumentChunker
 * Static utility class for chunking text documents
 */
export class DocumentChunker {
  /**
   * Chunk text into overlapping segments
   * @param text Input text to chunk
   * @param options Chunking options (size and overlap)
   * @returns Array of text chunks
   */
  static chunk(text: string, options: ChunkOptions): string[] {
    const { chunkSize, overlap } = options
    const chunks: string[] = []

    if (!text || text.trim().length === 0) {
      return chunks
    }

    let start = 0
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      const chunk = text.slice(start, end).trim()

      if (chunk.length > 0) {
        chunks.push(chunk)
      }

      // Move to next chunk with overlap
      start += chunkSize - overlap

      // Prevent infinite loop if overlap >= chunkSize
      if (overlap >= chunkSize && start <= 0) {
        start = chunkSize
      }
    }

    return chunks
  }
}
