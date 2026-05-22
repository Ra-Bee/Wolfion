import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import productsRouter from "./products";
import firebaseRouter from "./firebase";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(productsRouter);
router.use(firebaseRouter);

export default router;
