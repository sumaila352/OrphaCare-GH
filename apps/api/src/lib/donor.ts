import { prisma } from './prisma.js';

export async function getDonorForUser(userId: number) {
  return prisma.donor.findFirst({
    where: { userId, deletedAt: null },
  });
}

export async function ensureDonorForUser(userId: number, fullName: string, email: string) {
  const existing = await getDonorForUser(userId);
  if (existing) return existing;
  return prisma.donor.create({
    data: { userId, fullName, email },
  });
}
