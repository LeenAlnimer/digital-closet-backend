import { PrismaClient, ClothingType, Season, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// شكل البيانات اللي بنستقبلها وقت الإنشاء
export interface CreateItemInput {
  name: string;
  imageUrl?: string | null;
  type?: ClothingType;
  color?: string;
  season?: Season;
  tags?: string[];
}

// شكل البيانات وقت التعديل (كلها optional)
export interface UpdateItemInput {
  name?: string;
  imageUrl?: string | null;
  type?: ClothingType;
  color?: string;
  season?: Season;
  tags?: string[];
}

// إنشاء قطعة جديدة
export async function createItem(userId: string, data: CreateItemInput) {
  const { name, imageUrl, type, color, season, tags } = data;

  const itemData: Prisma.ClothingItemUncheckedCreateInput = {
    userId,
    name,
    tags: tags ?? [],
  };

  if (imageUrl !== undefined) itemData.imageUrl = imageUrl ?? null;
  if (type !== undefined) itemData.type = type;
  if (color !== undefined) itemData.color = color;
  if (season !== undefined) itemData.season = season;

  const item = await prisma.clothingItem.create({
    data: itemData,
  });

  return item;
}

// جلب كل القطع مع search + filter
export async function getItems(
  userId: string,
  options: {
    search?: string;
    type?: ClothingType;
    color?: string;
    season?: Season;
    tags?: string[];
  }
) {
  const { search, type, color, season, tags } = options;

  const where: any = {
    userId,
  };

  // بحث بالاسم أو ضمن التاغز
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        tags: {
          has: search,
        },
      },
    ];
  }

  if (type) {
    where.type = type;
  }

  if (color) {
    where.color = {
      equals: color,
      mode: "insensitive",
    };
  }

  if (season) {
    where.season = season;
  }

  if (tags && tags.length > 0) {
    // لازم تكون القطعة فيها كل التاغز اللي جايين
    where.tags = {
      hasEvery: tags,
    };
  }

  const items = await prisma.clothingItem.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return items;
}

// جلب قطعة واحدة بالتحديد
export async function getItemById(userId: string, itemId: string) {
  const item = await prisma.clothingItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  return item;
}

// تعديل قطعة
export async function updateItem(userId: string, itemId: string, data: UpdateItemInput) {
  // نتأكد أنها تبعت نفس اليوزر
  const existing = await prisma.clothingItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!existing) {
    throw new Error("ITEM_NOT_FOUND");
  }

  const updated = await prisma.clothingItem.update({
    where: { id: itemId },
    data,
  });

  return updated;
}

// حذف قطعة
export async function deleteItem(userId: string, itemId: string) {
  const existing = await prisma.clothingItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!existing) {
    throw new Error("ITEM_NOT_FOUND");
  }

  await prisma.clothingItem.delete({
    where: { id: itemId },
  });

  return true;
}
