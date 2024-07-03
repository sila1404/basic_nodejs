import { EMessage, SMessage, StatusOrder } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import { v4 as uuidv4 } from "uuid";
import { validateData } from "../service/validate.js";
import UploadImageToCloud from "../config/cloudinary.js";
import conn from "../config/db_mysql.js";

export default class OrderController {
  static async selectAll(req, res) {
    try {
      const select = "SELECT * FROM orders";
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
      const oUuid = req.params.oUuid;
      const check = "SELECT * FROM orders WHERE oUuid = ?";
      conn.query(check, oUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " orders", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " orders");
        }

        return SendSuccess(res, SMessage.GetOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async insert(req, res) {
    try {
      const { totalPrice, user_id } = req.body;
      const validate = await validateData({ totalPrice, user_id });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const billQR = req.files;
      if (!billQR) {
        return SendError400(res, EMessage.BadRequest + " billQR");
      }
      const image_url = await UploadImageToCloud(billQR.billQR.data);
      if (!image_url) {
        return SendError400(res, EMessage.UploadImageError);
      }

      const oUuid = uuidv4();
      const mysql =
        "INSERT INTO orders (oUuid, totalPrice, billQR, user_id, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      conn.query(
        mysql,
        [
          oUuid,
          totalPrice,
          image_url,
          user_id,
          StatusOrder.pending,
          dateTime,
          dateTime,
        ],
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

  static async updateOrderStatuc(req, res) {
    try {
      const oUuid = req.params.oUuid;
      const { status } = req.body;
      if (!status) {
        return SendError400(res, EMessage.BadRequest + " status");
      }

      const check = Object.assign(StatusOrder);
      if (!check.include(status)) {
        return SendError400(res, EMessage.BadRequest + " status not match");
      }

      const checkOUuid = "SELECT * FROM orders WHERE oUuid = ?";
      conn.query(checkOUuid, oUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " orders", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " orders");
        }

        const update = "UPDATE orders SET status = ? WHERE oUuid = ?";
        conn.query(update, [status, oUuid], (err, result) => {
          if (err) {
            return SendError400(res, EMessage.InsertError, err);
          }

          return SendSuccess(res, SMessage.Insert);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async deleteOrder(req, res) {
    try {
      const oUuid = req.params.oUuid;
      const check = "SELECT * FROM orders WHERE oUuid = ?";
      conn.query(check, oUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " orders", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " orders");
        }

        const deleteBanner = "DELETE FROM orders WHERE oUuid = ?";
        conn.query(deleteBanner, result[0]["oUuid"], (err, result) => {
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
