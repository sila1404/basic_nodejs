import { join } from "path";
import conn from "../config/db_mysql.js";
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

export default class OrderDetailController {
  static async selectAll(req, res) {
    try {
      const selectall = `SELECT order_detail.ordID, order_detail.ordUuid, order_detail.orders_id,
      product.name, product.price, product.image, 
      order_detail.amount, order_detail.total,order_detail.createdAt,
      order_detail.updatedAt FROM order_detail
      INNER JOIN product ON order_detail.product_id = pUuid
      INNER JOIN orders ON order_detail.orders_id = oUuid
      `;
      conn.query(selectall, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " order_detail", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " order_detail");
        }

        return SendSuccess(res, SMessage.GetAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async selectOne(req, res) {
    try {
      const ordUuid = req.params.ordUuid;
      const selectOne = "SELECT * FROM order_detail WHERE ordUuid=?";
      conn.query(selectOne, ordUuid, (err, result) => {
        if (err)
          return SendError404(res, EMessage.NotFound + " order detail", err);
        if (!result[0])
          return SendError404(res, EMessage.NotFound + " order detail");
        return SendSuccess(res, SMessage.GetOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async selectBy(req, res) {
    try {
      const orders_id = req.params.orders_id;
      const select = "SELECT * FROM order_detail WHERE orders_id = ?";
      conn.query(select, orders_id, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " order", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " order");
        }

        return SendSuccess(res, SMessage.GetAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
  static async insert(req, res) {
    try {
      const { orders_id, product_id, amount, total } = req.body;
      const validate = await validateData({
        orders_id,
        product_id,
        amount,
        total,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate + join(", "));
      }

      const ordUuid = uuidv4();
      const checkProduct = "SELECT * FROM product WHERE pUuid = ?";
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      conn.query(checkProduct, product_id, (errProduct, products) => {
        if (errProduct) {
          return SendError404(res, EMessage.NotFound + " product");
        }
        if (!products[0]) {
          return SendError404(res, EMessage.NotFound + " product");
        }

        const checkOrder = "SELECT * FROM orders WHERE oUuid=?";
        conn.query(checkOrder, orders_id, (errOrder, orders) => {
          if (errOrder) {
            return SendError404(res, EMessage.NotFound + " order");
          }
          if (!orders[0]) {
            return SendError404(res, EMessage.NotFound + " order");
          }
          const insert = `INSERT INTO order_detail (ordUuid, orders_id, product_id, amount,
            total, createdAt, updatedAt)
            VALUES (?,?,?,?,?,?,?)`;
          conn.query(
            insert,
            [ordUuid, orders_id, product_id, amount, total, datetime, datetime],
            (err) => {
              if (err) {
                return SendError404(res, EMessage.InsertError, err);
              }

              return SendCreate(res, SMessage.Insert);
            }
          );
        });
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }
}
