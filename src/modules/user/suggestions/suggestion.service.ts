import { PrismaClient, ClothingType, Season } from "@prisma/client";

const prisma = new PrismaClient();

/* ===============================
   Types
================================ */
export type SuggestionQuery = {
  occasion?: string;
  season?: string;
  color?: string;
  tags?: string[];
  date?: string;
  limit?: number;
};

/* ===============================
   Helpers
================================ */
function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOccasion(value?: string) {
  return value ? value.trim().toUpperCase() : undefined;
}

function toSeason(value?: string): Season | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(Season).includes(upper as Season)) {
    return upper as Season;
  }
  return undefined;
}

function hasType(
  items: { clothingItem: { type: ClothingType | null } }[],
  type: ClothingType
) {
  return items.some((i) => i.clothingItem.type === type);
}

/* ===============================
   Outfit completeness rule
================================ */
function completenessScore(
  items: { clothingItem: { type: ClothingType | null } }[]
) {
  let score = 0;

  if (hasType(items, ClothingType.TOP)) score += 1;
  if (hasType(items, ClothingType.BOTTOM)) score += 1;
  if (hasType(items, ClothingType.SHOES)) score += 1;

  return score;
}

/* ===============================
   MAIN FUNCTION
================================ */
export async function getSmartSuggestions(
  userId: string,
  query: SuggestionQuery
) {
  const {
    occasion,
    season,
    color,
    tags = [],
    limit = 10,
  } = query;

  const parsedOccasion = normalizeOccasion(occasion);
  const parsedSeason = toSeason(season);

  // 1️⃣ Get all outfits for user
  const outfits = await prisma.outfit.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          clothingItem: true,
        },
      },
    },
  });

  // 2️⃣ Apply rule-based filters
  let filtered = outfits.filter((outfit) => {
    // Occasion rule
    if (parsedOccasion && outfit.occasion !== parsedOccasion) {
      return false;
    }

    // Season rule
    if (parsedSeason) {
      const matchesSeason = outfit.items.some(
        (i) =>
          i.clothingItem.season === parsedSeason ||
          i.clothingItem.season === Season.ALL
      );
      if (!matchesSeason) return false;
    }

    // Color rule
    if (color) {
      const hasColor = outfit.items.some(
        (i) =>
          i.clothingItem.color &&
          normalize(i.clothingItem.color) === normalize(color)
      );
      if (!hasColor) return false;
    }

    // Tags rule
    if (tags.length > 0) {
      const normalizedTags = tags.map(normalize);
      const hasTags = outfit.items.some((i) =>
        i.clothingItem.tags.some((t) =>
          normalizedTags.includes(normalize(t))
        )
      );
      if (!hasTags) return false;
    }

    return true;
  });

  // 3️⃣ Sort by completeness
  filtered.sort(
    (a, b) =>
      completenessScore(b.items) - completenessScore(a.items)
  );

  // 4️⃣ Limit
  return filtered.slice(0, limit);
}
