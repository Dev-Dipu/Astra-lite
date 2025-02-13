import { Router } from "express";
import {askAI, checkunique} from "../controllers/service.controllers.js";

const router = Router();

router.route("/checkunique/:field/:value").get(checkunique);

router.route("/askai").post(askAI);

export default router;