import { EMessage, SMessage } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import { validateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import UploadImageToCloud from "../config/cloudinary.js";
import conn from "../config/db_mysql.js";

export default class BannerController {
  static async selectAll(req, res) {
    try {
      const select = "SELECT * FROM banner";
      conn.query(select, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound);
        }

        return SendSuccess(res, SMessage.GetAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async selectOne(req, res) {
    try {
      const bUuid = req.params.bUuid;
      const check = "SELECT * FROM banner WHERE bUuid = ?";
      conn.query(check, bUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " banner", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " banner");
        }

        return SendSuccess(res, SMessage.GetOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async insert(req, res) {
    try {
      const { title, detail } = req.body;
      const validate = await validateData({ title, detail });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const image = req.files;
      if (!image) {
        return SendError400(res, EMessage.PleaseInput + " image");
      }

      const image_url = await UploadImageToCloud(image.image.data);
      if (!image_url) {
        return SendError400(res, EMessage.UploadImageError);
      }

      const bUuid = uuidv4();
      const insert =
        "INSERT INTO banner (bUuid, title, detail, image, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)";
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      conn.query(
        insert,
        [bUuid, title, detail, image_url, dateTime, dateTime],
        (err, result) => {
          if (err) {
            return SendError400(res, EMessage.InsertError, err);
          }

          return SendCreate(res, SMessage.Insert);
        }
      );
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async updateBanner(req, res) {
    try {
      const bUuid = req.params.bUuid;
      const { title, detail } = req.body;
      const validate = await validateData({ title, detail });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const image = req.files;
      if (!image) {
        return SendError400(res, EMessage.PleaseInput + " image");
      }

      const checkBanner = "SELECT * FROM banner WHERE bUuid = ?";
      conn.query(checkBanner, bUuid, async (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " banner", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " banner");
        }

        const image_url = await UploadImageToCloud(image.image.data);
        if (!image_url) {
          return SendError400(res, EMessage.UploadImageError);
        }

        const update =
          "UPDATE banner SET title = ?, detail = ?, image = ?, updatedAt = ? WHERE bUuid = ?";
        const dateTime = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        conn.query(
          update,
          [title, detail, image_url, dateTime, result[0]["bUuid"]],
          (err, result) => {
            if (err) {
              return SendError400(res, EMessage.UpdateError, err);
            }

            return SendSuccess(res, SMessage.Update);
          }
        );
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async deleteBanner(req, res) {
    try {
      const bUuid = req.params.bUuid;
      const checkBanner = "SELECT * FROM banner WHERE bUuid = ?";
      conn.query(checkBanner, bUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " banner", err);
        }
        if(!result[0]) {
          return SendError404(res, EMessage.NotFound + " banner");
        }

        const deleteBanner = "DELETE FROM banner WHERE bUuid = ?";
        conn.query(deleteBanner, result[0]["bUuid"], (err, result) => {
          if (err) {
            return SendError400(res, EMessage.DeleteError, err);
          }

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
