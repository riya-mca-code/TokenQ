import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { allowRoles } from "../middleware/role";
import { resolveOrganization } from "../middleware/organization";
import { validate } from "../middleware/validate";
import {
  createQueueController,
  deleteQueueController,
  listQueuesController,
  updateQueueController,
} from "../controllers/queue.controller";
import { createQueueSchema, queueIdParamSchema, updateQueueSchema } from "../validation/queue";

const router = Router();

router.use(authRequired, resolveOrganization);

router.get("/", allowRoles("OWNER", "ADMIN", "STAFF"), listQueuesController);
router.post("/", allowRoles("OWNER", "ADMIN"), validate(createQueueSchema), createQueueController);
router.put("/:queueId", allowRoles("OWNER", "ADMIN"), validate(updateQueueSchema), updateQueueController);
router.delete("/:queueId", allowRoles("OWNER", "ADMIN"), validate(queueIdParamSchema), deleteQueueController);

export { router as queueRoutes };
