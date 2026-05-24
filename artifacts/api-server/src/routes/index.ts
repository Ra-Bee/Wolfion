import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import productsRouter from "./products";
import firebaseRouter from "./firebase";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(productsRouter);
router.use(firebaseRouter);
router.use(usersRouter);

export default router;
