import { Router } from "express"
import { signUp, signIn } from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 *   tags:
 *     name: Auth
 *     description: Endpoints for sign-in sign-up
 */

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Register new user
 *     description: Creates new user in DB
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "Кто-то"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "somebody@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "1234"
 *                 role:
 *                  type: string
 *                  default: user
 *                  example: user
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  user: 
 *                      type: object
 *                      properties:
 *                      id:
 *                          type: string
 *                          example: "507f1f77bcf86cd799439011"
 *                      username:
 *                          type: string
 *                          example: "Кто-то"
 *                      email:
 *                          type: string
 *                          example: "somebody@gmail.com"
 *                      token:
 *                          type: string
 *                      message:
 *                          type: string
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email is required"
 *       500:
 *         description: Ошибка сервера
 */
router.post("/sign-up", signUp);

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "Кто-то"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "1234"
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 username:
 *                   type: string
 *                   example: "Кто-то"
 *                 email:
 *                   type: string
 *                   example: "somebody@gmail.com"
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email is required"
 *       500:
 *         description: Ошибка сервера
 */
router.post("/sign-in", signIn)

export default router;