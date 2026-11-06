export async function POST(req: Request) {
  try {
    const { messages, systemInstruction } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local", { status: 500 });
    }

    const contents = messages.map((m: any) => {
      const parts: any[] = [];
      if (m.image) {
        // Base64 format: data:image/png;base64,xxxx
        const mimeType = m.image.split(";")[0].replace("data:", "");
        const base64Data = m.image.split(",")[1];
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
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

    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3-flash-preview",
      "gemini-flash-latest",
      "gemma-4-31b-it"
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
      return new Response(`All streaming models failed: ${lastError}`, { status: 503 });
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
    const errorMsg = err?.message || String(err);
    return new Response(`Server error: ${errorMsg}`, { status: 500 });
  }
}
