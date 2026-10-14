'use server';

import { requireAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleLikeMember(targetUserId: string, isLiked?: boolean) {
  try {
    const user = await requireAuthUser();

    if (isLiked) {
      await prisma.like.delete({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId: user.id,
            targetUserId,
          },
        },
      });
    } else {
      await prisma.like.create({
        data: {
          sourceUserId: user.id,
          targetUserId,
        },
      });
    }
    revalidatePath('/members');
    revalidatePath(`/members/${targetUserId}`);
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCurrentUserLikeIds() {
  try {
    const user = await requireAuthUser();

    const likes = await prisma.like.findMany({
      where: {
        sourceUserId: user.id,
      },
      select: {
        targetUserId: true,
      },
    });

    return likes.map((like) => like.targetUserId);
  } catch (error) {
    console.error(error);
  }
}
