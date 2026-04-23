import { Request, Response } from "express";
import { User } from "../models/user.model";

import { Format_phone_number } from "../utils/simplefunctions.util";
import jwt from "jsonwebtoken";

import { serialize } from "cookie";
import bcrypt from "bcryptjs";
import generateTokens from "../utils/generatetoken.util";
import { parse } from "cookie";
import { jwtDecode } from "jwt-decode";
import { MakeActivationCode } from "../utils/generate_activation.util";
import { sendTextMessage } from "../utils/sms_sender.util";
import { UserhistoryModel } from "../models/userHistory.model";



// User Registration

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, phone_number } = req.body;
        if (!username || !email || !password || !phone_number) {
            res.status(400).json("All fields are required")
            return
        }
        let phone = await Format_phone_number(phone_number); //format the phone number
        const userExists: any = await User.findOne(
            {
                $or: [
                    { name: phone_number },
                    { phone_number: phone },
                    { email: email },
                ],

            }
        );

        if (userExists) {
            res.status(400).json("User already exists")
            return
        }
        const salt = await bcrypt.genSalt(10);

        req.body.password = await bcrypt.hash(req.body.phone_number, salt);
        let activationcode = MakeActivationCode(4)

        req.body.phone_number = phone
        req.body.activationCode = activationcode
        const user: any = new User(req.body);
        const newUser = await user.save();


        res.status(201).json({ ok: true, message: "User registered successfully", newUser });
        return;

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
};

export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { newPassword, phone_number } = req.body
        let phone = await Format_phone_number(phone_number);
        const user: any = await User.findOne({ phone_number: phone });  // Find the user by ID
        if (!user) {
            res.status(400).json("user not found");
            return
        }
        user.password = newPassword
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully" });
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
}
export const getUsers = async (req: Request, res: Response) => {
    try {

        const user: any = await User.find();  // Find the user by ID
        console.log(user)
        res.status(200).json(user);
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
}

export const Update: any = async (req: Request | any, res: Response | any) => {
    try {
        let updates: any = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, useFindAndModify: false })
        res.status(200).json(updates._id)
        return
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
        return
    }
};
export const getUser = async (req: Request | any, res: Response | any) => {
    try {
        let user
        if (req?.user?.userId) {
            user = await User.findById(req.user.userId);
            console.log(user)
            res.status(200).json(user);
        }

        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
}

export const requestToken = async (req: Request, res: Response) => {
    try {

        const { phone_number } = req.body
        let phone = await Format_phone_number(phone_number);

        const user: any = await User.findOne({ phone_number: phone });  // Find the user by ID
        if (!user) {
            console.log("User Not Found")
            res.status(400).json("user not found");
            return
        }

        let activationcode = MakeActivationCode(4)
        user.activationCode = activationcode
        await user.save();
        await sendTextMessage(
            `Hi ${user.name} \nWelcome to Marapesa\nYour your activation Code is ${activationcode}`,
            `${phone}`,
            user._id,
            "account-activation"
        )
        res.status(200).json(`Token sent to ***********${phone.slice(-3)}`);
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
}
export const activateuser = async (req: Request, res: Response) => {
    try {
        const { phone_number, code } = req.body
        let phone = await Format_phone_number(phone_number);
        const user = await User.findOne({ phone_number: phone });
        if (!user) {
            res.status(400).json("user not found");
            return
        }

        if (user.activationCode === code) {
            user.activationCode = ""
            user.activated = true
            await user.save();
            res.status(200).json({ ok: true, message: "user activated " });
            return;
        }
        else {
            res.status(400).json("wrong Activation code ");
            return
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
}
export const verifyuser = async (req: Request, res: Response) => {
    try {
        const { phone_number, code } = req.body
        let phone = await Format_phone_number(phone_number);
        const user = await User.findOne({ phone_number: phone });
        if (!user) {
            res.status(400).json("user not found");
            return
        }
        if (user.activationCode === code) {
            res.status(200).json("code-is correct");
            return
        }
        else {
            res.status(400).json("wrong Activation code ");
            return
        }

    } catch (error) {
        console.log(error)
        res.status(500).json("Server error try again");
        return;

    }
}


// User Login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.method !== "POST") {
             res.status(405).json("Method Not Allowed");
        }

        const { phone_number, password } = req.body;

        // Format phone number
        const phone = await Format_phone_number(phone_number);

        // Find user
        const userExists: any = await User.findOne({
            $or: [
                { phone_number: phone_number },
                { phone_number: phone }
            ]
        }).select("phone_number name role activated password business pickup");

        if (!userExists) {
             res.status(400).json("User Not Found");
        }

        // Check password
        const isMatch = await bcrypt.compare(password, userExists.password);
        if (!isMatch) {
             res.status(401).json("Invalid credentials");
        }

        // 🔥 Conditional population
        if (userExists.role === "superadmin") {
            await userExists.populate({
                path: "business",
                populate: {
                    path: "pickUps"
                }
            });
        } else if (userExists.role === "admin") {
            await userExists.populate("pickup");
        } else {
            await userExists.populate("business");
        }

        // Generate tokens
        const { accessToken } = generateTokens(userExists, "7d");
        const decoded: any = jwtDecode(accessToken);

        // Set cookie
        res.setHeader(
            "Set-Cookie",
            serialize("sessionToken", accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 3600,
            })
        );

        // Remove password before sending response
        userExists.password = undefined;

         res.status(200).json({
            ok: true,
            message: "Logged in",
            token: accessToken,
            exp: decoded?.exp,
            user: userExists,
        });

    } catch (error: any) {
        console.log("Login Error:", error);
         res.status(500).json({
            ok: false,
            message: "Server error",
            error: error.message,
        });
    }
};
// session check
export const session_Check = async (req: Request, res: Response) => {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.sessionToken;
    if (!token) {
        // NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        res.status(401).json({ message: "Unauthorized" })
        return
    };
    try {

        const user: any = jwt.verify(token, process.env.JWT_SECRET ? process.env.JWT_SECRET : "your_secret_key");
        res.status(200).json(user);
        return
    } catch (error) {
        res.status(401).json({ ok: "false", message: "Invalid token" });
    }
}

export const Bulk = async (req: Request, res: Response): Promise<void> => {
    try {
        const { users } = req.body;

        if (!users || !Array.isArray(users)) {
            res.status(400).json({
                success: false,
                message: "Users array is required",
            });
            return;
        }

        const processedUsers: any[] = [];

        for (const item of users) {
            const { phone_number, business_id } = item;

            const phone = await Format_phone_number(phone_number);

            let user = await User.findOne({
                phone_number: phone,
            });

            let now = new Date();

            // =====================
            // CREATE
            // =====================
            if (!user) {
                const activationCode = MakeActivationCode(4);

                const salt = await bcrypt.genSalt(10);
                const passwordEncrypt = await bcrypt.hash(phone, salt);

                const newUser = new User({
                    ...item,
                    business: business_id,
                    password: passwordEncrypt,
                    phone_number: phone,
                    activationCode,
                    activated: false,
                });

                const saved = await newUser.save();

                // ✅ CREATE HISTORY
                await UserhistoryModel.create({
                    user: saved._id,
                    phone_number: phone,
                    business: business_id,
                    started_at: now,
                });

                processedUsers.push(saved);
                continue;
            }

            // =====================
            // UPDATE
            // =====================

            const previousBusiness = user.business?.toString();

            // If deleted_at exists → force deactivation
            if (user.deleted_at) {
                user.activated = false;
            }

            // If deleted AND not activated → reset password
            if (user.deleted_at && user.activated === false) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(phone, salt);
                user.activated = true;
            }

            // =====================
            // HANDLE BUSINESS CHANGE
            // =====================
            if (previousBusiness !== business_id) {
                // 
                const activeHistory = await UserhistoryModel.findOne({
                    user: user._id,
                    business: previousBusiness,
                    ended_at: null,
                });

                if (activeHistory) {
                    activeHistory.ended_at = now;

                    // Optional: compute duration
                    if (activeHistory.started_at) {
                        activeHistory.duration = new Date(
                            now.getTime() - activeHistory.started_at.getTime()
                        );
                    }

                    await activeHistory.save();
                }

                // 🟢 Create new history
                await UserhistoryModel.create({
                    user: user._id,
                    phone_number: phone,
                    business: business_id,
                    started_at: now,
                });
            }

            // Always update business
            user.business = business_id;

            // Update other fields
            user = Object.assign(user, item);

            const updated = await user?.save();
            processedUsers.push(updated);
        }

        res.status(200).json({
            success: true,
            total_processed: processedUsers.length,
            users: processedUsers,
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
export const UpdatedSince = async (req: Request | any, res: Response | any) => {
    try {

        const since = new Date(req.query.since);
        const users = await User.find({ updatedAt: { $gt: since }, business: req.user.business });

        res.status(200).json({ users: users });
    } catch (err: any) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: "Unauthorized" })
        return
    };
    jwt.verify(refreshToken, process.env.REFRESH_SECRET ? process.env.REFRESH_SECRET : "my_secret_key", (err: any, decoded: any) => {
        if (err) {
            res.status(403).json({ message: "Forbidden" })
            return
        };
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET ? process.env.JWT_SECRET : "your_secret_key",
            { expiresIn: "15m" }
        );

        res.json({ accessToken: newAccessToken });
        return
    });
};
export const logout = async (req: Request, res: Response) => {
    res.setHeader("Set-Cookie", serialize("sessionToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0, // Expire immediately
    }));

    res.status(200).json({ message: "Logged out" });
    return
};


