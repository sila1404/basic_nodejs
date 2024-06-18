import CryptoJS from "crypto-js";
import { SCREATKEY } from "../config/config.js";
import jwt from "jsonwebtoken";

export const Decrypts = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const decoded = CryptoJS.AES.decrypt(data, SCREATKEY).toString(
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
      const encrypt = CryptoJS.AES.encrypt(data, SCREATKEY).toString();

      resolve(encrypt);
    } catch (error) {
      reject(error);
    }
  });
};
