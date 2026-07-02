import express from "express";
import {
  createTransaction,
  getTransactionsByGroup,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from "../controllers/transaction.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.post("/", createTransaction);

router.get("/summary/:groupId", getTransactionSummary);

router.get("/group/:groupId", getTransactionsByGroup);

router
  .route("/:id")
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
