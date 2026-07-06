import { Request, Response } from "express";
import { Transaction } from "../models/Transaction.model";
import { Group } from "../models/Group.model";
import { User } from "../models/User.model";
import { sendTransactionNotification } from "../utils/notifications";

// --------------------- Helpers ---------------------
const formatTransactionResponse = (transaction: any) => ({
  id: transaction._id,
  amount: transaction.amount,
  type: transaction.type,
  category: transaction.category,
  description: transaction.description,
  date: transaction.date,
  notes: transaction.notes || "",
  group: transaction.groupId
    ? {
        id: transaction.groupId._id || transaction.groupId,
        name: transaction.groupId.name || "",
      }
    : null,
  user: transaction.userId
    ? {
        id: transaction.userId._id || transaction.userId,
        name: transaction.userId.name || "",
        email: transaction.userId.email || "",
      }
    : null,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
});

// --------------------- Controllers ---------------------

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

    // Validate required fields
    if (!amount || !type || !category || !description || !groupId) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: amount, type, category, description, groupId",
      });
      return;
    }

    // Validate group ownership
    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or you don't have access",
      });
      return;
    }

    // Create transaction
    const transaction = new Transaction({
      amount: Number(amount),
      type,
      category,
      description: description.trim(),
      date: date || new Date(),
      notes: notes?.trim() || "",
      groupId,
      userId,
    });

    await transaction.save();

    // Update group balance
    const balanceChange = type === "credit" ? amount : -amount;
    group.balance += balanceChange;
    await group.save();

    // Populate for response
    await transaction.populate("groupId", "name");
    await transaction.populate("userId", "name email phoneNumber");

    // Send notifications (async, don't await to not block response)
    const user = await User.findById(userId);
    if (user) {
      sendTransactionNotification({ user, group, transaction }).catch((err) =>
        console.error("❌ Notification error:", err),
      );
    }

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: formatTransactionResponse(transaction),
    });
  } catch (error: any) {
    console.error("❌ Create transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
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
    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or you don't have access",
      });
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
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("groupId", "name")
        .populate("userId", "name email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const formatted = transactions.map(formatTransactionResponse);

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: {
        transactions: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
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

    const transaction = await Transaction.findOne({ _id: id, userId })
      .populate("groupId", "name")
      .populate("userId", "name email")
      .lean();

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: formatTransactionResponse(transaction),
    });
  } catch (error: any) {
    console.error("❌ Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
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

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // Store old values for balance adjustment
    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const groupId = transaction.groupId;

    // Allowed updates
    const allowed = [
      "amount",
      "type",
      "category",
      "description",
      "date",
      "notes",
    ];
    let hasUpdates = false;

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        (transaction as any)[key] =
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

    await transaction.save();

    // Update group balance
    const group = await Group.findById(groupId);
    if (group) {
      // Revert old effect
      group.balance += oldType === "credit" ? -oldAmount : oldAmount;
      // Apply new effect
      group.balance +=
        transaction.type === "credit"
          ? transaction.amount
          : -transaction.amount;
      await group.save();
    }

    await transaction.populate("groupId", "name");
    await transaction.populate("userId", "name email");

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: formatTransactionResponse(transaction),
    });
  } catch (error: any) {
    console.error("❌ Update transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
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

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // Update group balance
    const group = await Group.findById(transaction.groupId);
    if (group) {
      group.balance +=
        transaction.type === "credit"
          ? -transaction.amount
          : transaction.amount;
      await group.save();
    }

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: { id: transaction._id },
    });
  } catch (error: any) {
    console.error("❌ Delete transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: error.message,
    });
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

    // Validate group access
    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      res.status(404).json({
        success: false,
        message: "Group not found or you don't have access",
      });
      return;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Run aggregations in parallel
    const [totalCredit, totalDebit, categorySpending, monthlySpending] =
      await Promise.all([
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
        Transaction.aggregate([
          {
            $match: {
              groupId: group._id,
              date: { $gte: startOfMonth, $lte: endOfMonth },
              type: "debit",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
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
    });
  } catch (error: any) {
    console.error("❌ Get summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
      error: error.message,
    });
  }
};
