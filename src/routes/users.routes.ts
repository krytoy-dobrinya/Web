import { Router } from "express"
import { getUsers, createUser, deleteUser, updateUser } from "../controllers/users.controller";
import { authMiddleware } from "../middleWares/authMiddleWare";
import { UserRoles } from "../models/User";

const router = Router();
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать пользователя
 *     description: Добавляет нового пользователя в систему
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
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
// Добавить пользователя
router.post("/", createUser);
/**
 * @swagger
 *  /users:
 *    get:
 *      summary: Получить список пользователей
 *      description: Возвращает список пользователей
 *      tags: [Users]
 *      security: [{ bearerAuth: []}]
 *      responses:
 *        201: 
 *          description: Успешный ответ
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      example: 67f4c70441b7447c466a53ab
 *                    username:
 *                      type: string
 *                      example: Кто-то
 *                    email:
 *                      type: string
 *                      example: somebody@gmail.com
 *        500:
 *         description: Ошибка сервера. Не удалось получить данные.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
// Получить всех пользователей
router.get("/", authMiddleware([UserRoles.admin, UserRoles.moderator]), getUsers);

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Изменить информацию о пользователе
 *     description: Изменяет информацию о пользователе
 *     tags: [Users]
 *     security: [{ bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - username
 *               - email
 *               - password
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
 *     responses:
 *       200:
 *         description: Информация о пользователе изменена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "Кто-то"
 *                 email:
 *                   type: string
 *                   example: "somebody@gmail.com"
 *                 password:
 *                   type: string
 *                   example: "1234"
 *                 _id:
 *                   type: string
 *                   example: "680e60c402216be6d0ff8b54"
 *                 __v:
 *                   type: int
 *                   example: 0
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is required"
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.put("/", updateUser);

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Удалить пользователя
 *     description: Удаляет пользователя по ID
 *     tags: [Users]
 *     security: [{ bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Успешное удаление
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Ошибка сервера
 */
// Удалить пользователя
router.delete("/", authMiddleware([UserRoles.admin]), deleteUser);
export default router;