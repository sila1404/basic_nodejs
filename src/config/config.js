import "dotenv/config";

const PORT = process.env.PORT;
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY;
const URL_DATABASE = process.env.MYSQL_HOST;
const USERNAME = process.env.MYSQL_USER;
const PASSWORD = process.env.MYSQL_PASSWORD;
const DATABASE_PORT = process.env.MYSQL_PORT;
const DATABASE_NAME = process.env.MYSQL_DATABASE;
const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY
const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET

export {
  PASSWORD,
  SECRET_KEY,
  PORT,
  URL_DATABASE,
  USERNAME,
  DATABASE_PORT,
  DATABASE_NAME,
  CLOUDINARY_KEY,
  CLOUDINARY_SECRET
};
