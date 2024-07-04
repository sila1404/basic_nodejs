import { join } from "path";
import conn from "../config/db_mysql";
import { EMessage, SMessage } from "../service/message";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
} from "../service/response";
import { validateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";

export default class OrderDetailController {
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

          const insert = `insert into orders (ordUuid,orders_id,product_id,amount,
            total,createdAt,updatedAt)
             values (?,?,?,?,?,?,?)`;
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
