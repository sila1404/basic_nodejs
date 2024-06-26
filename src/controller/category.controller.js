import conn from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import { v4 as uuidv4 } from "uuid";

export default class CategoryController {
  static async selectAll(req, res) {
    try {
      const select = "SELECT * FROM category";
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
      const cUuid = req.params.cUuid;
      const check = "SELECT * FROM category WHERE cUuid = ?";
      conn.query(check, cUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " category");
        }

        return SendSuccess(res, SMessage.GetOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async insert(req, res) {
    try {
      const { title } = req.body;
      if (!title) {
        return SendError400(res, EMessage.BadRequest + " title");
      }

      const cUuid = uuidv4();
      const mysql =
        "INSERT INTO category (cUuid, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)";
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      conn.query(mysql, [cUuid, title, dateTime, dateTime], (err, result) => {
        if (err) {
          return SendError400(res, EMessage.InsertError, err);
        }

        return SendCreate(res, SMessage.Insert);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async updateCategory(req, res) {
    try {
      const cUuid = req.params.cUuid;
      const { title } = req.body;
      if (!title) return SendError400(res, EMessage.BadRequest + " title");

      const check = "SELECT * FROM category WHERE cUuid = ?";
      const dateTime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      conn.query(check, cUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " category");
        }

        const update =
          "UPDATE category SET title = ?, updatedAt = ? WHERE cUuid = ?";
        conn.query(
          update,
          [title, dateTime, result[0]["cUuid"]],
          (err, result) => {
            if (err) {
              return SendError400(res, EMessage.UpdateError, err);
            }

            return SendSuccess(res, SMessage.Update);
          }
        );
      });
    } catch (error) {
      console.log(error)
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async deleteCategory(req, res) {
    try {
      const cUuid = req.params.cUuid;
      const check = "SELECT * FROM category WHERE cUuid = ?";
      conn.query(check, cUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " category");
        }

        const deleteCategory = "DELETE FROM category WHERE cUuid = ?";
        conn.query(deleteCategory, result[0]["cUuid"], (err, result) => {
          if (err) {
            return SendError400(res, EMessage.DeleteError);
          }

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
