import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'Admin', slug: 'admin' },
    { name: 'Staff', slug: 'staff' },
    { name: 'Donor', slug: 'donor' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: {},
      create: role,
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { slug: 'admin' } });
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@orphacare.local' },
    update: { passwordHash },
    create: {
      fullName: 'System Administrator',
      email: 'admin@orphacare.local',
      passwordHash,
      status: 'active',
      roles: { create: [{ roleId: adminRole.id }] },
    },
  });

  const childCount = await prisma.child.count();
  if (childCount === 0) {
    await prisma.child.createMany({
      data: [
        {
          fullName: 'Ama Mensah',
          dateOfBirth: new Date('2016-03-12'),
          gender: 'female',
          admissionDate: new Date('2022-01-15'),
          status: 'active',
          notes: 'Enrolled in primary school support.',
        },
        {
          fullName: 'Kwame Osei',
          dateOfBirth: new Date('2014-08-22'),
          gender: 'male',
          admissionDate: new Date('2021-06-03'),
          status: 'active',
        },
        {
          fullName: 'Efua Boateng',
          dateOfBirth: new Date('2018-11-05'),
          gender: 'female',
          admissionDate: new Date('2023-04-20'),
          status: 'active',
          notes: 'Medical follow-up scheduled.',
        },
      ],
    });
  }

  const inventoryCount = await prisma.inventoryItem.count();
  if (inventoryCount === 0) {
    await prisma.inventoryItem.createMany({
      data: [
        { itemName: 'Rice (25kg bags)', category: 'food', quantity: 4, unit: 'bags', lowStockThreshold: 6 },
        { itemName: 'Children sandals (assorted)', category: 'clothing', quantity: 12, unit: 'pairs', lowStockThreshold: 15 },
        { itemName: 'Paracetamol syrup', category: 'medical', quantity: 8, unit: 'bottles', lowStockThreshold: 10 },
      ],
    });
  }

  const staffCount = await prisma.staff.count();
  if (staffCount === 0) {
    await prisma.staff.createMany({
      data: [
        { fullName: 'Grace Adjei', position: 'Caregiver', phone: '0244000001', status: 'active' },
        { fullName: 'Samuel Tetteh', position: 'Administrator', phone: '0244000002', status: 'active' },
      ],
    });
  }

  const donorCount = await prisma.donor.count();
  if (donorCount === 0) {
    await prisma.donor.create({
      data: { fullName: 'Community Church Accra', email: 'gifts@example.org', phone: '0302000000' },
    });
  }

  const donationCount = await prisma.donation.count();
  if (donationCount === 0) {
    const donor = await prisma.donor.findFirst();
    await prisma.donation.create({
      data: {
        donorId: donor?.id,
        type: 'cash',
        amount: 2500,
        currency: 'GHS',
        reference: 'DEMO-001',
        notes: 'Sample monthly pledge',
      },
    });
  }

  console.log(`Seeded admin user id=${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
