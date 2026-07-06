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

// ==================== All routes are protected ====================
router.use(authenticate);

// ==================== Group Routes ====================
router
  .route("/")
  .get(getGroups) // GET /api/groups - Get all groups
  .post(createGroup); // POST /api/groups - Create a group

router
  .route("/:id")
  .get(getGroupById) // GET /api/groups/:id - Get single group
  .put(updateGroup) // PUT /api/groups/:id - Update group
  .delete(deleteGroup); // DELETE /api/groups/:id - Delete group

export default router;
