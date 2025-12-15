import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateScheduleInput {
  outfitId: string;
  date: string; // ISO string
  note?: string;
}

export interface UpdateScheduleInput {
  outfitId?: string;
  date?: string; // ISO string
  note?: string | null;
}

// Helper: تحويل تاريخ من string إلى Date مع validation
function parseDateOrThrow(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return d;
}

// ✅ Create schedule (حجز outfit على يوم)
export async function createSchedule(userId: string, data: CreateScheduleInput) {
  const { outfitId, date, note } = data;

  const scheduleDate = parseDateOrThrow(date);

  // تأكد إن الأوتفيت للـ user نفسه
  const outfit = await prisma.outfit.findFirst({
    where: { id: outfitId, userId },
  });
  if (!outfit) throw new Error("OUTFIT_NOT_FOUND");

  try {
    const created = await prisma.outfitSchedule.create({
      data: {
        userId,
        outfitId,
        date: scheduleDate,
        note: note ?? null,
      },
      include: {
        outfit: {
          include: {
            items: { include: { clothingItem: true } },
          },
        },
      },
    });

    return created;
  } catch (err: any) {
    // Unique constraint: @@unique([userId, date])
    if (err?.code === "P2002") {
      throw new Error("DATE_ALREADY_SCHEDULED");
    }
    throw err;
  }
}

// ✅ Get schedules (كلها أو حسب range)
export async function getSchedules(
  userId: string,
  options?: { from?: string; to?: string }
) {
  const where: Prisma.OutfitScheduleWhereInput = { userId };

  if (options?.from || options?.to) {
    where.date = {};
    if (options.from) (where.date as any).gte = parseDateOrThrow(options.from);
    if (options.to) (where.date as any).lte = parseDateOrThrow(options.to);
  }

  return prisma.outfitSchedule.findMany({
    where,
    orderBy: { date: "asc" },
    include: {
      outfit: {
        include: {
          items: { include: { clothingItem: true } },
        },
      },
    },
  });
}

// ✅ Get schedule by id
export async function getScheduleById(userId: string, scheduleId: string) {
  return prisma.outfitSchedule.findFirst({
    where: { id: scheduleId, userId },
    include: {
      outfit: {
        include: {
          items: { include: { clothingItem: true } },
        },
      },
    },
  });
}

// ✅ Update schedule
export async function updateSchedule(
  userId: string,
  scheduleId: string,
  data: UpdateScheduleInput
) {
  const existing = await prisma.outfitSchedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!existing) throw new Error("SCHEDULE_NOT_FOUND");

  const updateData: Prisma.OutfitScheduleUpdateInput = {};

  if (data.note !== undefined) updateData.note = data.note;

  if (data.date !== undefined) {
    updateData.date = parseDateOrThrow(data.date);
  }

  if (data.outfitId !== undefined) {
    // تأكد إن الأوتفيت للـ user نفسه
    const outfit = await prisma.outfit.findFirst({
      where: { id: data.outfitId, userId },
    });
    if (!outfit) throw new Error("OUTFIT_NOT_FOUND");

    updateData.outfit = { connect: { id: data.outfitId } };
  }

  try {
    return await prisma.outfitSchedule.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        outfit: {
          include: {
            items: { include: { clothingItem: true } },
          },
        },
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new Error("DATE_ALREADY_SCHEDULED");
    }
    throw err;
  }
}

// ✅ Delete schedule
export async function deleteSchedule(userId: string, scheduleId: string) {
  const existing = await prisma.outfitSchedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!existing) throw new Error("SCHEDULE_NOT_FOUND");

  await prisma.outfitSchedule.delete({
    where: { id: scheduleId },
  });

  return true;
}
