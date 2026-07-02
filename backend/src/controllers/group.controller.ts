import { Request, Response } from "express";
import { Group } from "../models/Group.model";
import { ApiResponse } from "../types";
import { Transaction } from "../models/Transaction.model";

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

    if (!name || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: "Group name is required",
      } as ApiResponse);
      return;
    }

    const group = new Group({
      name,
      type: type || "personal",
      description,
      email,
      phoneNumber,
      createdBy: userId,
    });

    await group.save();

    // Populate creator info
    await group.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating group",
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Get All Groups
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const groups = await Group.find({
      createdBy: userId,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      data: groups,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching groups",
      error: error.message,
    } as ApiResponse);
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

    const group = await Group.findOne({
      _id: id,
      createdBy: userId,
    }).populate("createdBy", "name email");

    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or unauthorized",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Group fetched successfully",
      data: group,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching group",
      error: error.message,
    } as ApiResponse);
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

    const group = await Group.findOne({
      _id: id,
      createdBy: userId,
    });

    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or unauthorized",
      } as ApiResponse);
      return;
    }

    // Allowed updates
    const allowedUpdates = [
      "name",
      "type",
      "description",
      "email",
      "phoneNumber",
    ];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (group as any)[key] = updates[key];
      }
    });

    await group.save();
    await group.populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: group,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating group",
      error: error.message,
    } as ApiResponse);
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

    const group = await Group.findOne({
      _id: id,
      createdBy: userId,
    });

    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or unauthorized",
      } as ApiResponse);
      return;
    }

    // Delete all transactions in this group
    await Transaction.deleteMany({ groupId: id });
    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting group",
      error: error.message,
    } as ApiResponse);
  }
};
