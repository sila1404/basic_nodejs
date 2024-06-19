import { validateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import conn from "../config/db_mysql.js";
import { EMessage, Role, SMessage } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../config/config.js";
import { Decrypts, GenerateToken } from "../service/service.js";

export default class UserController {
  static async selectAll(req, res) {
    try {
      const mysql = "SELECT * FROM user";
      conn.query(mysql, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound);

        return SendSuccess(res, SMessage.GetAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const validate = await validateData({ email, password });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }

      const checkEmail = "select * from user where email=?";

      conn.query(checkEmail, email, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound, err);

        if (!result[0]) return SendError404(res, EMessage.NotFound, err);

        const decryptPassword = await Decrypts(result[0]["password"]);

        if (password != decryptPassword) {
          return SendError400(res, "Password not match");
        }

        const data = {
          id: result[0]["uuid"],
          role: result[0]["role"],
        };

        const token = await GenerateToken(data);

        const newData = Object.assign(
          JSON.parse(JSON.stringify(result[0])),
          JSON.parse(JSON.stringify(token))
        );

        return SendSuccess(res, SMessage.Login, newData);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

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
      const generatePassword = CryptoJS.AES.encrypt(
        password,
        SECRET_KEY
      ).toString();

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
