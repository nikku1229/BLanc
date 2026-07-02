import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/group.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.route("/").get(getGroups).post(createGroup);

router.route("/:id").get(getGroupById).put(updateGroup).delete(deleteGroup);

export default router;
