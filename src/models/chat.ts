import { prisma } from "@/lib/prisma";
import { ChatMessage } from "@/types";
import { EventEmitter } from "events";

export const chatEmitter = new EventEmitter();
chatEmitter.setMaxListeners(100);

export async function getMessages(acaraId: number, page = 1, limit = 50) {
  const rows = await prisma.chatMessage.findMany({
    where: { acaraId },
    select: {
      id: true,
      acaraId: true,
      userId: true,
      message: true,
      createdAt: true,
      user: { select: { username: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  return rows.map((r) => ({
    id: r.id,
    acara_id: r.acaraId,
    user_id: r.userId,
    message: r.message,
    created_at: r.createdAt,
    username: r.user.username,
    avatar: r.user.avatar,
  })) as ChatMessage[];
}

export async function sendMessage(acaraId: number, userId: string, message: string) {
  const result = await prisma.chatMessage.create({
    data: { acaraId, userId, message },
    include: { user: { select: { username: true, avatar: true } } },
  });

  const msg: ChatMessage = {
    id: result.id,
    acara_id: result.acaraId,
    user_id: result.userId,
    message: result.message,
    created_at: result.createdAt,
    username: result.user.username,
    avatar: result.user.avatar,
  };

  chatEmitter.emit(`chat:${acaraId}`, msg);
  return msg;
}
