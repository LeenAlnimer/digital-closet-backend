
import { Response } from "express";
import { AuthRequest } from "../../../common/middleware/auth";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "./item.service";
import { ClothingType, Season } from "@prisma/client";

// Helper لتحويل سترينغ لـ Enum بشكل آمن
function toClothingType(value?: string): ClothingType | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(ClothingType).includes(upper as ClothingType)) {
    return upper as ClothingType;
  }
  return undefined;
}

function toSeason(value?: string): Season | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(Season).includes(upper as Season)) {
    return upper as Season;
  }
  return undefined;
}

// POST /items
export async function createItemHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, imageUrl, type, color, season, tags } = req.body;

    if (!name) {
      return res.status(422).json({ message: "Name is required" });
    }

    const parsedType = toClothingType(type);
    const parsedSeason = toSeason(season);

    const tagsArray: string[] = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const createData: Parameters<typeof createItem>[1] = {
      name,
      tags: tagsArray,
    };

    if (imageUrl !== undefined) createData.imageUrl = imageUrl ?? null;
    if (parsedType !== undefined) createData.type = parsedType;
    if (color !== undefined) createData.color = color;
    if (parsedSeason !== undefined) createData.season = parsedSeason;

    const item = await createItem(userId, createData);

    return res.status(201).json(item);
  } catch (err: any) {
    console.error("Error creating item:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /items
export async function getItemsHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { search, type, color, season, tags } = req.query;

    const parsedType = toClothingType(type as string | undefined);
    const parsedSeason = toSeason(season as string | undefined);

    const tagsArray: string[] =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : Array.isArray(tags)
        ? (tags as string[])
        : [];

    const filters: Parameters<typeof getItems>[1] = {};
    if (typeof search === "string" && search) filters.search = search;
    if (parsedType !== undefined) filters.type = parsedType;
    if (typeof color === "string" && color) filters.color = color;
    if (parsedSeason !== undefined) filters.season = parsedSeason;
    if (tagsArray.length) filters.tags = tagsArray;

    const items = await getItems(userId, filters);

    return res.status(200).json(items);
  } catch (err: any) {
    console.error("Error getting items:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /items/:id
export async function getItemByIdHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Item id is required" });
    }

    const item = await getItemById(userId, id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  } catch (err: any) {
    console.error("Error getting item:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PUT /items/:id
export async function updateItemHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Item id is required" });
    }

    const { name, imageUrl, type, color, season, tags } = req.body;

    const parsedType = toClothingType(type);
    const parsedSeason = toSeason(season);

    const tagsArray: string[] = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const updateData: Parameters<typeof updateItem>[2] = {};

    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ?? null;
    if (parsedType !== undefined) updateData.type = parsedType;
    if (color !== undefined) updateData.color = color;
    if (parsedSeason !== undefined) updateData.season = parsedSeason;
    if (tagsArray.length) updateData.tags = tagsArray;

    try {
      const updated = await updateItem(userId, id, updateData);

      return res.status(200).json(updated);
    } catch (err: any) {
      if (err.message === "ITEM_NOT_FOUND") {
        return res.status(404).json({ message: "Item not found" });
      }
      throw err;
    }
  } catch (err: any) {
    console.error("Error updating item:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// DELETE /items/:id
export async function deleteItemHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Item id is required" });
    }

    try {
      await deleteItem(userId, id);
      return res.status(200).json({ message: "Item deleted" });
    } catch (err: any) {
      if (err.message === "ITEM_NOT_FOUND") {
        return res.status(404).json({ message: "Item not found" });
      }
      throw err;
    }
  } catch (err: any) {
    console.error("Error deleting item:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
