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
import {
  Decrypts,
  Encrypts,
  GenerateToken,
  VerifyToken,
} from "../service/service.js";
import { UploadNewImageToCloud } from "../config/cloudinary.js";

export default class UserController {
  static async selectAll(req, res) {
    try {
      const mysql = "SELECT * FROM user";
      conn.query(mysql, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound);

        return SendSuccess(res, SMessage.GetAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async selectOne(req, res) {
    try {
      const uuid = req.params.uuid;

      const checkedUser = "SELECT * FROM user WHERE uuid = ?";
      conn.query(checkedUser, uuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " user");

        if (!result[0]) return SendError404(res, EMessage.NotFound + " user");

        return SendSuccess(res, SMessage.GetOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
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

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return SendError400(res, EMessage.BadRequest + " refreshToken");
      }

      const verifyData = await VerifyToken(refreshToken);
      if (!verifyData) {
        return SendError404(res, EMessage.NotFound);
      }

      const checkUuid = "SELECT * FROM user WHERE uuid = ?";
      conn.query(checkUuid, verifyData, async (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound);
        }

        const data = {
          id: verifyData,
          role: result[0]["role"],
        };

        const token = await GenerateToken(data);
        if (!token) return SendError500(res, EMessage.UpdateError);

        return SendSuccess(res, SMessage.Update, token);
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

  static async updatePassword(req, res) {
    try {
      const uuid = req.params.uuid;
      const { oldPassword, newPassword } = req.body;

      const validate = await validateData({ oldPassword, newPassword });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const checkUuid = "SELECT * FROM user WHERE uuid = ?";
      conn.query(checkUuid, uuid, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " uuid");

        const decryptPassword = await Decrypts(result[0]["password"]);
        if (oldPassword !== decryptPassword) {
          return SendError400(res, EMessage.NotMatch);
        }

        const update = "UPDATE user SET password = ? WHERE uuid = ?";
        const generatePassword = await Encrypts(newPassword);
        conn.query(update, [generatePassword, uuid], (err, result) => {
          if (err) return SendError404(res, EMessage.UpdateError, err);

          return SendSuccess(res, SMessage.Update);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email, password } = req.body;

      const validate = await validateData({ email, password });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const checkedEmail = "SELECT * FROM user WHERE email = ?";
      conn.query(checkedEmail, email, async (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " email");
        if (!result[0]) return SendError404(res, EMessage.NotFound + " email");

        const generatePassword = await Encrypts(password);

        const forgot = "UPDATE user SET password = ? WHERE uuid = ?";
        conn.query(
          forgot,
          [generatePassword, result[0]["uuid"]],
          (err, result) => {
            if (err) return SendError404(res, EMessage.UpdateError, err);

            return SendSuccess(res, SMessage.Update);
          }
        );
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async updateProfile(req, res) {
    try {
      const uuid = req.params.uuid;
      const image = req.files;
      if (!image) {
        return SendError400(res, EMessage.BadRequest + " image");
      }

      const check = "SELECT * FROM user WHERE uuid = ?";
      conn.query(check, uuid, async (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " user");
        }

        const image_url = await UploadNewImageToCloud(image.profile.data);
        if (!image_url) {
          return SendError400(res, EMessage.UploadImageError);
        }

        const update = "UPDATE user SET profile = ? WHERE uuid = ?";
        conn.query(update, [image_url, uuid], (err, result) => {
          if (err) {
            return SendError400(res, EMessage.UpdateError, err);
          }

          return SendSuccess(res, SMessage.Update);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async updateUser(req, res) {
    try {
      const uuid = req.params.uuid;
      const { username, phoneNumber } = req.body;

      const validate = await validateData({ username, phoneNumber });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const update =
        "UPDATE user SET username = ?, phoneNumber = ?, updatedAt = ? WHERE uuid = ?";
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");

      conn.query(
        update,
        [username, phoneNumber, dateTime, uuid],
        (err, result) => {
          if (err) return SendError404(res, EMessage.NotFound + " uuid");

          return SendSuccess(res, SMessage.Update);
        }
      );
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async deleteUser(req, res) {
    try {
      const uuid = req.params.uuid;

      const checkUuid = "SELECT * FROM user WHERE uuid = ?";
      conn.query(checkUuid, uuid, (err, result) => {
        if (err) return SendError404(res, EMessage.NotFound + " user");
        if (!result[0]) return SendError404(res, EMessage.NotFound + " user");

        const deleteUser = "DELETE FROM user WHERE uuid = ?";
        conn.query(deleteUser, uuid, (err, result) => {
          if (err) return SendError404(res, EMessage.DeleteError);

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
