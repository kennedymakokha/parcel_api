import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface UserPayload {
    _id: string;
    username: string;
    role: string;
    name: string;
    business?: { _id: string };
    pickup?: { _id: string };
}

const generateTokens = (user: UserPayload, accessExpiry: string) => {
    const jwtSecret = process.env.JWT_SECRET || "development_secret_key_change_in_prod";
    const refreshSecret = process.env.REFRESH_SECRET || "my_secret_key";
    const accessToken = jwt.sign(
        {
            userId: user._id,
            username: user.name,
            role: user.role,
            name: user.name,
            business: user?.business?._id,
            pickup: user?.pickup?._id
        },
        jwtSecret,
        { expiresIn: accessExpiry }
    );

    const refreshToken = jwt.sign(
        { userId: user._id },
        refreshSecret,
        { expiresIn: "7d" } // You could make this dynamic too if needed
    );

    return { accessToken, refreshToken };
};

export default generateTokens;
