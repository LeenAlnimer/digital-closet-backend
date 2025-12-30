import { Response } from "express";
import { AuthRequest } from "../../../common/middleware/auth";
import { getSmartSuggestions } from "./suggestion.service";

export async function getSuggestionsHandler(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { occasion, season, color, tags, date, limit } = req.query;

    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    const suggestions = await getSmartSuggestions(userId, {
      ...(typeof occasion === "string" && { occasion }),
      ...(typeof season === "string" && { season }),
      ...(typeof color === "string" && { color }),
      ...(parsedTags.length > 0 && { tags: parsedTags }),
      ...(typeof date === "string" && { date }),
      ...(limit && { limit: Number(limit) }),
    });

    return res.status(200).json({
      count: suggestions.length,
      suggestions,
    });
  } catch (err) {
    console.error("Suggestions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
