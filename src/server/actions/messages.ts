'use server';

import { chatSchema, ChatSchema } from '@/lib/schemas/chatSchema';
import { ActionResult, MessageDto } from '@/lib/types';
import { requireAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { mapMessageToMessageDto } from '@/lib/mappings';
import { createChatId, handlePrismaError } from '@/lib/util';
import { pusherServer } from '@/lib/pusher';

export async function createMessage(recipientUserId: string, data: ChatSchema): Promise<ActionResult<MessageDto>> {
  try {
    const user = await requireAuthUser();

    const validated = chatSchema.safeParse(data);

    if (!validated.success) return { status: 'error', error: validated.error.issues[0].message };

    const { text } = validated.data;

    const message = await prisma.message.create({
      data: {
        text,
        recipientId: recipientUserId,
        senderId: user.id,
      },
      select: messageSelect,
    });

    const messageDto = mapMessageToMessageDto(message);

    await pusherServer.trigger(createChatId(user.id, recipientUserId), 'message:new', messageDto);

    revalidatePath(`/messages/${recipientUserId}/chat`);

    return { status: 'success', data: messageDto };
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function getMessageThread(recipientId: string) {
  try {
    const user = await requireAuthUser();

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: user.id,
            recipientId,
            senderDeleted: false,
          },
          {
            senderId: recipientId,
            recipientId: user.id,
            recipientDeleted: false,
          },
        ],
      },
      orderBy: {
        created: 'asc',
      },
      select: messageSelect,
    });

    if (messages.length > 0) {
      const readMessageIds = messages
        .filter((m) => m.dateRead === null && m.recipient?.userId === user.id && m.sender?.userId === recipientId)
        .map((m) => m.id);

      await prisma.message.updateMany({
        where: { id: { in: readMessageIds } },
        data: { dateRead: new Date() },
      });

      await pusherServer.trigger(createChatId(recipientId, user.id), 'messages:read', readMessageIds);
    }

    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function markMessagesAsRead(messageIds: string[], senderId: string) {
  const user = await requireAuthUser();

  await prisma.message.updateMany({
    where: { id: { in: messageIds } },
    data: { dateRead: new Date() },
  });

  await pusherServer.trigger(createChatId(senderId, user.id), 'messages:read', messageIds);
}

export async function getMessagesByContainer(container = 'inbox') {
  try {
    const user = await requireAuthUser();

    const conditions = {
      [container === 'outbox' ? 'senderId' : 'recipientId']: user.id,
      ...(container === 'outbox' ? { senderDeleted: false } : { recipientDeleted: false }),
    };

    const messages = await prisma.message.findMany({
      where: conditions,
      orderBy: { created: 'desc' },
      select: messageSelect,
    });

    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const messageSelect = {
  id: true,
  text: true,
  created: true,
  dateRead: true,
  sender: {
    select: {
      userId: true,
      name: true,
      image: true,
    },
  },
  recipient: {
    select: {
      userId: true,
      name: true,
      image: true,
    },
  },
};

export async function deleteMessage(messageId: string, isOutbox: boolean): Promise<ActionResult<void>> {
  const selector = isOutbox ? 'senderDeleted' : 'recipientDeleted';

  try {
    const user = await requireAuthUser();

    await prisma.message.update({
      where: { id: messageId },
      data: {
        [selector]: true,
      },
    });

    const messagesToDelete = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: user.id,
            senderDeleted: true,
            recipientDeleted: true,
          },
          {
            recipientId: user.id,
            recipientDeleted: true,
            senderDeleted: true,
          },
        ],
      },
    });

    if (messagesToDelete.length > 0) {
      await prisma.message.deleteMany({
        where: {
          OR: messagesToDelete.map((m) => ({ id: m.id })),
        },
      });
    }

    revalidatePath(`/members/${user.id}/chat`);
    revalidatePath('/messages');

    return { status: 'success', data: undefined };
  } catch (error) {
    console.log(error);
    return handlePrismaError(error);
  }
}
