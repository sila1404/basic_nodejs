import express from "express";
import "dotenv/config";
import "./config/db_mongo.js";
import "./config/db_mysql.js";

import cors from "cors";
import bodyParser from "body-parser";

import router from "./router/index.js";

const app = express();

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(
  bodyParser.urlencoded({ extended: true, limit: "500mb", parameterLimit: 500 })
);

app.use("/api", router);

app.listen(3000, () => {
  console.log("Server: listening on http://localhost:3000/");
});
