import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ===== أنواع البيانات =====

export interface CreateOutfitInput {
  name: string;
  itemIds: string[];
}

export interface UpdateOutfitInput {
  name?: string;
  itemIds?: string[];
}

// ===== إنشاء Outfit =====
export async function createOutfit(userId: string, data: CreateOutfitInput) {
  const { name, itemIds } = data;

  const outfit = await prisma.outfit.create({
    data: {
      name,
      userId,
      items: {
        create: itemIds.map((itemId) => ({
          clothingItemId: itemId,
        })),
      },
    },
    include: {
      items: {
        include: {
          clothingItem: true,
        },
      },
    },
  });

  return outfit;
}

// ===== جلب كل Outfits =====
export async function getOutfits(userId: string) {
  return prisma.outfit.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          clothingItem: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ===== جلب Outfit واحد =====
export async function getOutfitById(userId: string, outfitId: string) {
  return prisma.outfit.findFirst({
    where: { id: outfitId, userId },
    include: {
      items: {
        include: {
          clothingItem: true,
        },
      },
    },
  });
}

// ===== تعديل Outfit =====
export async function updateOutfit(
  userId: string,
  outfitId: string,
  data: UpdateOutfitInput
) {
  const existing = await prisma.outfit.findFirst({
    where: { id: outfitId, userId },
  });

  if (!existing) {
    throw new Error("OUTFIT_NOT_FOUND");
  }

  const updateData: Prisma.OutfitUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.itemIds) {
    updateData.items = {
      deleteMany: {},
      create: data.itemIds.map((id) => ({
        clothingItemId: id,
      })),
    };
  }

  return prisma.outfit.update({
    where: { id: outfitId },
    data: updateData,
    include: {
      items: {
        include: {
          clothingItem: true,
        },
      },
    },
  });
}

// ===== حذف Outfit =====
export async function deleteOutfit(userId: string, outfitId: string) {
  const existing = await prisma.outfit.findFirst({
    where: { id: outfitId, userId },
  });

  if (!existing) {
    throw new Error("OUTFIT_NOT_FOUND");
  }

  await prisma.outfit.delete({
    where: { id: outfitId },
  });

  return true;
}
