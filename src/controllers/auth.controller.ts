import type { Response, Request } from "express"
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants";

export const signIn = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (!existingUser) {
        res.status(400).json({ message: "Username or password is incorrect" });
        return;
    }
    await bcrypt.compare(password, existingUser.password, function (err, result) {
        if (err || !result) {
            res.status(400).json({ message: "Username or password is incorrect" });
            return;
        } else {
            const userResponse = { username: existingUser.username, email: existingUser.email, role: existingUser.role }
            const token = jwt.sign(userResponse, JWT_SECRET)
            res.status(200).json({ user: userResponse, token, message: "Sugn-in successfuly" });
        }
    })
}

export const signUp = async (req: Request, res: Response) => {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: encryptedPassword, role });
    await user.save();
    const userResponse = { username: user.username, email: user.email, role: user.role }
    const token = jwt.sign(userResponse, JWT_SECRET)
    res.status(201).json({ user: userResponse, token, message: "Sugn-up successfuly" });
}