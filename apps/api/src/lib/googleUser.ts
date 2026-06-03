import { prisma } from './prisma.js';
import { ensureDonorForUser } from './donor.js';
import type { GoogleProfile } from './googleAuth.js';

type UserWithRoles = {
  id: number;
  fullName: string;
  email: string;
  status: string;
  googleId: string | null;
  roles: { role: { slug: string } }[];
};

function authUserPayload(user: UserWithRoles) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roles: user.roles.map((ur) => ur.role.slug),
  };
}

export async function findOrCreateUserFromGoogle(profile: GoogleProfile) {
  const include = { roles: { include: { role: true } } } as const;

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.googleId }, { email: profile.email }] },
    include,
  });

  if (user) {
    if (user.status !== 'active') {
      throw new Error('This account is disabled');
    }
    if (user.googleId && user.googleId !== profile.googleId) {
      throw new Error('This email is linked to a different Google account');
    }
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId },
        include,
      });
    }
    if (user.roles.some((ur) => ur.role.slug === 'donor')) {
      await ensureDonorForUser(user.id, user.fullName, user.email);
    }
    return authUserPayload(user);
  }

  const donorRole = await prisma.role.findUnique({ where: { slug: 'donor' } });
  if (!donorRole) {
    throw new Error('Donor role missing. Run database seed.');
  }

  const created = await prisma.user.create({
    data: {
      fullName: profile.fullName,
      email: profile.email,
      googleId: profile.googleId,
      passwordHash: null,
      roles: { create: [{ roleId: donorRole.id }] },
    },
    include,
  });

  await ensureDonorForUser(created.id, created.fullName, created.email);
  return authUserPayload(created);
}
