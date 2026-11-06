export async function POST(req: Request) {
  try {
    const { messages, systemInstruction } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable on server");
      return new Response("API key not configured", { status: 500 });
    }

    const contents = messages.map((m: any) => {
      const parts: any[] = [];
      if (m.image) {
        const mimeType = m.image.split(";")[0].replace("data:", "");
        const base64Data = m.image.split(",")[1];
        parts.push({
          inlineData: { mimeType, data: base64Data },
        });
      }
      if (m.content) {
        parts.push({ text: m.content });
      }
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts,
      };
    });

    const payload: any = { contents };

    if (systemInstruction && systemInstruction.trim().length > 0) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction.trim() }],
      };
    }

    // Supported production and fallback model endpoints
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest"
    ];

    let geminiStream: Response | null = null;
    let lastError = "";

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok && res.body) {
        geminiStream = res;
        break;
      } else {
        lastError = await res.text();
        console.warn(`Streaming failed for ${model}:`, lastError);
      }
    }

    if (!geminiStream || !geminiStream.body) {
      console.error("All Gemini models rejected request:", lastError);
      return new Response(`All models failed: ${lastError}`, { status: 503 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const clientStream = new ReadableStream({
      async start(controller) {
        const reader = geminiStream!.body!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (chunk) {
                      controller.enqueue(encoder.encode(chunk));
                    }
                  } catch (_) {}
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(clientStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("Server error handling chat:", err);
    return new Response(`Server error: ${err?.message || String(err)}`, { status: 500 });
  }
}
