import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../config/config.js";
import jwt from "jsonwebtoken";
import conn from "../config/db_mysql.js";

export const Decrypts = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const decoded = CryptoJS.AES.decrypt(data, SECRET_KEY).toString(
        CryptoJS.enc.Utf8
      );

      resolve(decoded);
    } catch (error) {
      reject(error);
    }
  });
};

export const Encrypts = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const encrypt = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();

      resolve(encrypt);
    } catch (error) {
      reject(error);
    }
  });
};

export const GenerateToken = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(data.role);
      const payload = {
        id: data.id,
        role: await Encrypts(data.role),
      };
      console.log(payload);

      const payload_refresh = {
        id: payload.id,
        role: payload.role,
      };

      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

      const refreshToken = jwt.sign(payload_refresh, SECRET_KEY, {
        expiresIn: "4h",
      });

      let date = new Date();
      let expiresIn = date.setHours(2 + date.getHours());

      resolve({ token, refreshToken, expiresIn });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const VerifyToken = async (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      jwt.verify(token, SECRET_KEY, (err, decode) => {
        if (err) reject(err);

        const mysql = "SELECT * FROM user WHERE uuid = ?";
        conn.query(mysql, decode["id"], (err, result) => {
          if (err) reject(err);

          resolve(result[0]["uuid"]);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
