import { Response } from "express";
import { AuthRequest } from "../../../common/middleware/auth";
import {
  createOutfit,
  getOutfits,
  getOutfitById,
  updateOutfit,
  deleteOutfit,
} from "./outfit.service";

// POST /outfits
export async function createOutfitHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, itemIds } = req.body;

    if (!name || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(422).json({
        message: "Name and itemIds array are required",
      });
    }

    const outfit = await createOutfit(userId, {
      name,
      itemIds,
    });

    return res.status(201).json(outfit);
  } catch (err: any) {
    console.error("Error creating outfit:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /outfits
export async function getOutfitsHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const outfits = await getOutfits(userId);
    return res.status(200).json(outfits);
  } catch (err: any) {
    console.error("Error getting outfits:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /outfits/:id
export async function getOutfitByIdHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Outfit id is required" });
    }

    const outfit = await getOutfitById(userId, id);

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    return res.status(200).json(outfit);
  } catch (err: any) {
    console.error("Error getting outfit:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PUT /outfits/:id
export async function updateOutfitHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Outfit id is required" });
    }

    const { name, itemIds } = req.body;

    try {
      const updated = await updateOutfit(userId, id, {
        name,
        itemIds,
      });

      return res.status(200).json(updated);
    } catch (err: any) {
      if (err.message === "OUTFIT_NOT_FOUND") {
        return res.status(404).json({ message: "Outfit not found" });
      }
      throw err;
    }
  } catch (err: any) {
    console.error("Error updating outfit:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// DELETE /outfits/:id
export async function deleteOutfitHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Outfit id is required" });
    }

    try {
      await deleteOutfit(userId, id);
      return res.status(200).json({ message: "Outfit deleted" });
    } catch (err: any) {
      if (err.message === "OUTFIT_NOT_FOUND") {
        return res.status(404).json({ message: "Outfit not found" });
      }
      throw err;
    }
  } catch (err: any) {
    console.error("Error deleting outfit:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
