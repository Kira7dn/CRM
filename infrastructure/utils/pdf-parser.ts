/**
 * PDF Parser Utility
 * Extracts text content from PDF files
 */

import pdf from "pdf-parse"

// Cấu hình tùy chọn cho pdf-parse
const pdfOptions = {
  max: 0, // Không giới hạn số lượng trang
  // Vô hiệu hóa các tính năng không cần thiết
  disableCombinedText: true,
  disableAutoFetch: true,
  disableFontFace: true,
  disableCreateObjectURL: true
  // Không cần thiết phải chỉ định version và pagerender
}

/**
 * PDFParser
 * Static utility class for parsing PDF documents
 */
export class PDFParser {
  /**
   * Extract text from PDF buffer
   * @param buffer PDF file as Buffer
   * @returns Promise resolving to extracted text
   */
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer, pdfOptions)
      return data.text
    } catch (error) {
      console.error("[PDFParser] Failed to extract text from PDF:", error)
      throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
