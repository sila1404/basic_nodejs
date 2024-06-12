import { validateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import conn from "../config/db_mysql.js";
import { Role } from "../service/message.js";

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
        return res.status(400).json({
          success: false,
          message: "Please input: " + validate.join(","),
        });
      }

      const uuid = uuidv4();
      const mysql =
        "INSERT INTO user (uuid, username, email, phoneNumber, password, role, createdAt, updatedAt) VALUES (? ,? ,? ,? ,? ,? ,? ,?);";
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ").replace(/\..+/, "");
      conn.query(
        mysql,
        [
          uuid,
          username,
          email,
          phoneNumber,
          password,
          Role.user,
          dateTime,
          dateTime,
        ],
        (err, result) => {
          if (err) {
            console.log(err)
            return res.status(400).json("Error Register");
          }

          return res.status(201).json({
            success: true,
            message: "Register Success",
          });
        }
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
