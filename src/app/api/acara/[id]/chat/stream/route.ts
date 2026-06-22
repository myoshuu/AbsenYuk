import { auth } from "@/auth";
import { isPeserta } from "@/models/acara";
import { chatEmitter } from "@/models/chat";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role === "user") {
    const joined = await isPeserta(Number(id), userId);
    if (!joined) return new Response("Forbidden", { status: 403 });
  }

  const acaraId = Number(id);
  const encoder = new TextEncoder();
  let connected = true;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("retry: 3000\n\n"));

      const handler = (msg: any) => {
        if (!connected) return;
        const payload = JSON.stringify(msg);
        try {
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          connected = false;
        }
      };

      chatEmitter.on(`chat:${acaraId}`, handler);

      req.signal.addEventListener("abort", () => {
        connected = false;
        chatEmitter.off(`chat:${acaraId}`, handler);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
