import type { Request, Response } from "express";
import { Group } from "../models/Group.model.ts";
import { Transaction } from "../models/Transaction.model.ts";

// --------------------- Helpers ---------------------
const formatGroupResponse = (group: any) => ({
  id: group._id,
  name: group.name,
  type: group.type,
  description: group.description || "",
  balance: group.balance,
  createdBy: group.createdBy
    ? {
        id: group.createdBy._id,
        name: group.createdBy.name,
        email: group.createdBy.email,
      }
    : null,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

// --------------------- Controllers ---------------------

// @desc    Create Group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, type, description, email, phoneNumber } = req.body;

    // Validate
    if (!name || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: "Group name is required and must be at least 2 characters",
      });
      return;
    }

    const group = new Group({
      name: name.trim(),
      type: type || "personal",
      description: description?.trim() || "",
      email: email?.trim() || "",
      phoneNumber: phoneNumber?.trim() || "",
      createdBy: userId,
    });

    await group.save();
    await group.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: formatGroupResponse(group),
    });
  } catch (error: any) {
    console.error("❌ Create group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: error.message,
    });
  }
};

// @desc    Get All Groups
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const groups = await Group.find(
      { createdBy: userId },
      "name type description balance createdBy createdAt updatedAt", // ✅ Select only needed fields
    )
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = groups.map(formatGroupResponse);

    res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      data: formatted,
    });
  } catch (error: any) {
    console.error("❌ Get groups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message,
    });
  }
};

// @desc    Get Single Group
// @route   GET /api/groups/:id
// @access  Private
export const getGroupById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const group = await Group.findOne(
      { _id: id, createdBy: userId },
      "name type description email phoneNumber balance createdBy createdAt updatedAt",
    )
      .populate("createdBy", "name email")
      .lean();

    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or you don't have access",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Group fetched successfully",
      data: formatGroupResponse(group),
    });
  } catch (error: any) {
    console.error("❌ Get group by id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group",
      error: error.message,
    });
  }
};

// @desc    Update Group
// @route   PUT /api/groups/:id
// @access  Private
export const updateGroup = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const group = await Group.findOne({ _id: id, createdBy: userId });
    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or you don't have access",
      });
      return;
    }

    // ✅ Allowed fields to update
    const allowed = ["name", "type", "description", "email", "phoneNumber"];
    let hasUpdates = false;

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        (group as any)[key] =
          typeof updates[key] === "string" ? updates[key].trim() : updates[key];
        hasUpdates = true;
      }
    }

    if (!hasUpdates) {
      res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
      return;
    }

    await group.save();
    await group.populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: formatGroupResponse(group),
    });
  } catch (error: any) {
    console.error("❌ Update group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update group",
      error: error.message,
    });
  }
};

// @desc    Delete Group
// @route   DELETE /api/groups/:id
// @access  Private
export const deleteGroup = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const group = await Group.findOne({ _id: id, createdBy: userId });
    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or you don't have access",
      });
      return;
    }

    // ✅ Delete all associated transactions
    await Transaction.deleteMany({ groupId: id });
    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
      data: { id: group._id, name: group.name },
    });
  } catch (error: any) {
    console.error("❌ Delete group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete group",
      error: error.message,
    });
  }
};
