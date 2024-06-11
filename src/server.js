import express from "express";
import "dotenv/config";
import "./config/db_mongo.js";
import "./config/db_mysql.js"

const app = express();

app.listen(3000, () => {
  console.log("Server: listening on http://localhost:3000/");
});
