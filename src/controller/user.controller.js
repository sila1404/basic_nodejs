import { validateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import conn from "../config/db_mysql.js";
import { Role } from "../service/message.js";
import { SendCreate, SendError400, SendError500 } from "../service/response.js";
import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../config/config.js";

export default class UserController {
  static async register(req, res) {
    try {
      // Get data from request body
      const { username, email, password, phoneNumber } = req.body;
      // Validate the input
      const validate = await validateData({
        username,
        email,
        phoneNumber,
        password,
      });
      if (validate.length > 0) {
        return SendError400(res, `Please input: ${validate.join(", ")}`);
      }

      
      const uuid = uuidv4();
      const mysql =
        "INSERT INTO user (uuid, username, email, phoneNumber, password, role, createdAt, updatedAt) VALUES (? ,? ,? ,? ,? ,? ,? ,?);";
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");

      // Hash password before insert to table
      const generatePassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString()

      // Insert data to table
      conn.query(
        mysql,
        [
          uuid,
          username,
          email,
          phoneNumber,
          generatePassword,
          Role.user,
          dateTime,
          dateTime,
        ],
        (err, result) => {
          if (err) {
            return SendError400(res, "Resgister Error", err);
          }

          return SendCreate(res, "Register success");
        }
      );
    } catch (error) {
      return SendError500(res, "Internal Server Error", error);
    }
  }
}
