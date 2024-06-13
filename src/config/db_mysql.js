import mysql from "mysql";
import {
  DATABASE_NAME,
  DATABASE_PORT,
  PASSWORD,
  URL_DATABASE,
  USERNAME,
} from "./config.js";

const conn = mysql.createConnection({
  host: URL_DATABASE,
  port: DATABASE_PORT,
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE_NAME,
});

conn.connect((err) => {
  if (err) console.log("MySQL Database: fail to connect");

  console.log("MySQL Database: connected successfully");
});

export default conn;
