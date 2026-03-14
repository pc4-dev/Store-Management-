/**
 * Safely parses JSON from AI responses, handling potential truncation or markdown formatting.
 */
export function safeJsonParse<T>(text: string | undefined, defaultValue: T): T {
  if (!text) return defaultValue;

  let cleanedText = text.trim();

  // Strip markdown code blocks if present
  if (cleanedText.includes("```")) {
    cleanedText = cleanedText.replace(/```json\n?|```/g, "").trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("JSON parse failed, attempting to repair truncated JSON:", error);

    // If it's an array and it's truncated
    if (cleanedText.startsWith("[")) {
      // Try to find the last complete object
      const lastObjectEnd = cleanedText.lastIndexOf("}");
      if (lastObjectEnd !== -1) {
        try {
          // Close the last object and the array
          // We add a closing brace just in case the last object itself was truncated inside a string
          // But it's safer to just cut at the last known good object boundary
          const repaired = cleanedText.substring(0, lastObjectEnd + 1) + "]";
          return JSON.parse(repaired);
        } catch (repairError) {
          console.error("JSON repair failed:", repairError);
        }
      }
    }
    
    // If it's an object and it's truncated
    if (cleanedText.startsWith("{")) {
       const lastComma = cleanedText.lastIndexOf(",");
       const lastPropertyEnd = cleanedText.lastIndexOf("\"");
       // Repairing objects is trickier, but let's try to close it
       const lastBrace = cleanedText.lastIndexOf("}");
       if (lastBrace === -1) {
          // Try to close it at the last possible valid point
          // This is very speculative
       }
    }

    throw error;
  }
}
