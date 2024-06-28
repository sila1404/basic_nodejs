import UploadImageToCloud from "../config/cloudinary";
import conn from "../config/db_mysql";
import { EMessage, SMessage } from "../service/message.js";
import {
  SendCreate,
  SendError400,
  SendError404,
  SendError500,
  SendSuccess,
} from "../service/response.js";
import { v4 as uuidv4 } from "uuid";
import { validateData } from "../service/validate.js";

export default class ProductController {
  static async selectAll(req, res) {
    try {
      const mysql = "SELECT * FROM product";
      conn.query(mysql, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " product");
        }

        return SendSuccess(res, SMessage.GetAll, result);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async selectOne(req, res) {
    try {
      const pUuid = req.params.pUuid;
      const checkProduct = "SELECT * FROM product WHERE pUuid = ?";
      conn.query(checkProduct, pUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " product", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " product");
        }

        return SendSuccess(res, SMessage.GetOne, result[0]);
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async insert(req, res) {
    try {
      const { name, detail, amount, price, category_id } = req.body;
      const validate = await validateData({
        name,
        detail,
        amount,
        price,
        category_id,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const image = req.files;
      if (!image) {
        return SendError400(res, EMessage.BadRequest + " image");
      }

      const checkCategory = "SELECT * FROM category WHERE cUuid = ?";
      conn.query(checkCategory, category_id, async (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " category", err);
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " category");
        }

        const image_url = await UploadImageToCloud(image.image.data);
        if (!image_url) {
          return SendError400(res, EMessage.UploadImageError);
        }

        const pUuid = uuidv4();
        const insert =
          "INSERT INTO product (pUuid, name, detail, amount, price, image, category_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const dateTime = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        conn.query(
          insert,
          [
            pUuid,
            name,
            detail,
            amount,
            price,
            image_url,
            result[0]["cUuid"],
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
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async updateProduct(req, res) {
    try {
      const { name, detail, amount, price, category_id } = req.body;
      const pUuid = req.params.pUuid;
      const validate = await validateData({
        name,
        detail,
        amount,
        price,
        category_id,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(", "));
      }

      const image = req.files;
      if (!image) {
        return SendError400(res, EMessage.BadRequest + " image");
      }

      const checkProductId = "SELECT * FROM product WHERE pUuid = ?";
      conn.query(checkProductId, pUuid, (err, productData) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " product", err);
        }
        if (!productData[0]) {
          return SendError404(res, EMessage.NotFound + " product");
        }

        const checkCategory = "SELECT * FROM category WHERE cUuid = ?";
        conn.query(
          checkCategory,
          category_id,
          async (errCategory, categoryData) => {
            if (err) {
              return SendError404(
                res,
                EMessage.NotFound + " category",
                errCategory
              );
            }
            if (!categoryData[0]) {
              return SendError404(res, EMessage.NotFound + " category");
            }

            const image_url = await UploadImageToCloud(image.image.data);
            if (!image_url) {
              return SendError400(res, EMessage.BadRequest + " image");
            }

            const update =
              "UPDATE product SET name = ?, detail = ?, amount = ?, price = ?, image = ?, category_id , updatedAt = ? WHERE pUuid = ?";
            const dateTime = new Date()
              .toISOString()
              .replace(/T/, " ")
              .replace(/\..+/, "");
            conn.query(
              update,
              [
                name,
                detail,
                amount,
                price,
                image_url,
                category_id,
                dateTime,
                pUuid,
              ],
              (errUpdate) => {
                if (errUpdate) {
                  return SendError400(res, EMessage.UpdateError, err);
                }

                return SendSuccess(res, SMessage.Update);
              }
            );
          }
        );
      });
    } catch (error) {
      return SendError500(res, EMessage.Server, error);
    }
  }

  static async deleteProduct(req, res) {
    try {
      const pUuid = req.params.cUuid;
      const check = "SELECT * FROM product WHERE pUuid = ?";
      conn.query(check, pUuid, (err, result) => {
        if (err) {
          return SendError404(res, EMessage.NotFound + " product");
        }
        if (!result[0]) {
          return SendError404(res, EMessage.NotFound + " product");
        }

        const deleteCategory = "DELETE FROM product WHERE pUuid = ?";
        conn.query(deleteCategory, result[0]["pUuid"], (err, result) => {
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
