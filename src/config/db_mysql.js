import mysql from "mysql";

const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MSQL_DATABASE,
});

conn.connect((err) => {
  if (err) console.log("MySQL Database: fail to connect");

  console.log("MySQL Database: connected successfully");
});

export default conn;
