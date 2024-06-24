import express from "express";
import "./config/db_mongo.js";
import "./config/db_mysql.js";

import cors from "cors";
import bodyParser from "body-parser";
import { PORT } from "./config/config.js";
import fileUpload from "express-fileupload";

import router from "./router/index.js";

const app = express();

app.use(cors());
app.use(fileUpload())
app.use(bodyParser.json({ extended: true }));
app.use(
  bodyParser.urlencoded({ extended: true, limit: "500mb", parameterLimit: 500 })
);

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server: listening on http://localhost:${PORT}/`);
});
