import pdfParse from "pdf-parse";

/**
 * Extracts plain text from a PDF file buffer.
 * Returns an empty string if extraction fails (graceful degradation).
 */
export async function parsePdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("Failed to parse PDF text:", error);
    throw new Error("Failed to parse PDF report. Ensure it is a valid PDF.");
  }
}
