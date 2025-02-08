import { Router } from "express";
import {checkunique} from "../controllers/service.controllers.js";

const router = Router();

router.route("/checkunique/:field/:value").get(checkunique);

export default router;