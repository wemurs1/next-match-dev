'use server';

import { chatSchema, ChatSchema } from '@/lib/schemas/chatSchema';
import { ActionResult } from '@/lib/types';
import { Message } from '../../../generated/prisma/client';
import { requireAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { mapMessageToMessageDto } from '@/lib/mappings';

export async function createMessage(recipientUserId: string, data: ChatSchema): Promise<ActionResult<Message>> {
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
    });

    revalidatePath(`/messages/${recipientUserId}/chat`);

    return { status: 'success', data: message };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { status: 'error', error: error.message };
    } else {
      return { status: 'error', error: 'Something went wrong' };
    }
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
      select: {
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
      },
    });

    return messages.map(message=>mapMessageToMessageDto(message));
  } catch (error) {
    console.log(error);
  }
}
