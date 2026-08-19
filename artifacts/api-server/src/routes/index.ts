import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import productsRouter from "./products";
import firebaseRouter from "./firebase";
import usersRouter from "./users";
import authRouter from "./auth";
import presenceRouter from "./presence";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(productsRouter);
router.use(firebaseRouter);
router.use(usersRouter);
router.use(authRouter);
router.use(presenceRouter);

export default router;
