import { Request, Response } from "express";
import { Transaction } from "../models/Transaction.model";
import { Group } from "../models/Group.model";
import { User } from "../models/User.model";
import { ApiResponse } from "../types";
import { sendTransactionNotification } from "../utils/notifications";

// @desc    Create Transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { amount, type, category, description, date, notes, groupId } =
      req.body;

    // Validate group
    const group = await Group.findOne({
      _id: groupId,
      createdBy: userId,
    });

    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or unauthorized",
      } as ApiResponse);
      return;
    }

    // Create transaction
    const transaction = new Transaction({
      amount,
      type,
      category,
      description,
      date: date || new Date(),
      notes,
      groupId,
      userId,
    });

    await transaction.save();

    // Update group balance
    if (type === "credit") {
      group.balance += amount;
    } else {
      group.balance -= amount;
    }
    await group.save();

    // Populate references
    await transaction.populate("groupId", "name");
    await transaction.populate("userId", "name email phoneNumber");

    // Send notifications
    const user = await User.findById(userId);
    if (user) {
      await sendTransactionNotification({
        user,
        group,
        transaction,
      });
    }

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating transaction",
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Get All Transactions for Group
// @route   GET /api/transactions/group/:groupId
// @access  Private
export const getTransactionsByGroup = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;
    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
    } = req.query;

    // Validate group access
    const group = await Group.findOne({
      _id: groupId,
      createdBy: userId,
    });

    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or unauthorized",
      } as ApiResponse);
      return;
    }

    // Build filter
    const filter: any = { groupId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("groupId", "name")
        .populate("userId", "name email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Get Single Transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({
      _id: id,
      userId,
    })
      .populate("groupId", "name")
      .populate("userId", "name email");

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching transaction",
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Update Transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const transaction = await Transaction.findOne({
      _id: id,
      userId,
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      } as ApiResponse);
      return;
    }

    // Store old amount and type for balance adjustment
    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const groupId = transaction.groupId;

    // Update transaction
    const allowedUpdates = [
      "amount",
      "type",
      "category",
      "description",
      "date",
      "notes",
    ];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (transaction as any)[key] = updates[key];
      }
    });

    await transaction.save();

    // Update group balance
    const group = await Group.findById(groupId);
    if (group) {
      // Remove old transaction effect
      if (oldType === "credit") {
        group.balance -= oldAmount;
      } else {
        group.balance += oldAmount;
      }

      // Add new transaction effect
      if (transaction.type === "credit") {
        group.balance += transaction.amount;
      } else {
        group.balance -= transaction.amount;
      }
      await group.save();
    }

    await transaction.populate("groupId", "name");
    await transaction.populate("userId", "name email");

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating transaction",
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Delete Transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({
      _id: id,
      userId,
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      } as ApiResponse);
      return;
    }

    // Update group balance
    const group = await Group.findById(transaction.groupId);
    if (group) {
      if (transaction.type === "credit") {
        group.balance -= transaction.amount;
      } else {
        group.balance += transaction.amount;
      }
      await group.save();
    }

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting transaction",
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Get Transaction Summary
// @route   GET /api/transactions/summary/:groupId
// @access  Private
export const getTransactionSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await Group.findOne({
      _id: groupId,
      members: userId,
    });

    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or unauthorized",
      } as ApiResponse);
      return;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalCredit, totalDebit, categorySpending] = await Promise.all([
      Transaction.aggregate([
        { $match: { groupId: group._id, type: "credit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { groupId: group._id, type: "debit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { groupId: group._id, type: "debit" } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          groupId: group._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          type: "debit",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      message: "Transaction summary fetched successfully",
      data: {
        totalCredit: totalCredit[0]?.total || 0,
        totalDebit: totalDebit[0]?.total || 0,
        balance: group.balance,
        monthlySpending: monthlySpending[0]?.total || 0,
        topCategories: categorySpending,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching summary",
      error: error.message,
    } as ApiResponse);
  }
};
