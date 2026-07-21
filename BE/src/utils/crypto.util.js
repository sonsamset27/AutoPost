import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ALGORITHM = "aes-256-gcm";

// ENCRYPTION_KEY phải dài đúng 32 bytes
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

if (SECRET_KEY.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte hex string.");
}

const CryptoUtil = {
    encrypt(data) {
        if (!data) return null;

        const iv = crypto.randomBytes(12);

        const cipher = crypto.createCipheriv(
            ALGORITHM,
            SECRET_KEY,
            iv
        );

        const encrypted = Buffer.concat([
            cipher.update(JSON.stringify(data), "utf8"),
            cipher.final(),
        ]);

        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString("hex"),
            authTag: authTag.toString("hex"),
            content: encrypted.toString("hex"),
        };
    },

    decrypt(payload) {
        if (!payload) return null;

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            SECRET_KEY,
            Buffer.from(payload.iv, "hex")
        );

        decipher.setAuthTag(
            Buffer.from(payload.authTag, "hex")
        );

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(payload.content, "hex")),
            decipher.final(),
        ]);

        return JSON.parse(decrypted.toString("utf8"));
    },
};

export default CryptoUtil;