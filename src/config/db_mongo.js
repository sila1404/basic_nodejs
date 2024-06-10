import mongoose from "mongoose";

const connection = mongoose
  .connect(`${process.env.MONGODB_URI}`)
  .then(() => {
    console.log("Database: connected successfully");
  })
  .catch(() => {
    console.log("Database: fail to connect");
  });

export default connection;
