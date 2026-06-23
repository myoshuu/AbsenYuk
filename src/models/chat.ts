import { prisma } from "@/lib/prisma";
import { ChatMessage } from "@/types";

export async function getMessages(acaraId: number, page = 1, limit = 50) {
  const rows = await prisma.chatMessage.findMany({
    where: { acaraId },
    select: {
      id: true,
      acaraId: true,
      userId: true,
      username: true,
      message: true,
      createdAt: true,
      user: { select: { avatar: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  return rows.map((r) => ({
    id: r.id,
    acara_id: r.acaraId,
    user_id: r.userId,
    username: r.username,
    message: r.message,
    created_at: r.createdAt,
    avatar: r.user.avatar,
  })) as ChatMessage[];
}

export async function sendMessage(acaraId: number, userId: string, message: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  const result = await prisma.chatMessage.create({
    data: {
      acaraId,
      userId,
      username: user?.username ?? "Unknown",
      message,
    },
    include: { user: { select: { avatar: true } } },
  });

  const msg: ChatMessage = {
    id: result.id,
    acara_id: result.acaraId,
    user_id: result.userId,
    username: result.username,
    message: result.message,
    created_at: result.createdAt,
    avatar: result.user.avatar,
  };

  return msg;
}
