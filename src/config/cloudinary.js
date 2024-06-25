import cloudinary from "cloudinary";

import { CLOUDINARY_KEY, CLOUDINARY_SECRET } from "./config.js";

cloudinary.v2.config({
  cloud_name: "drhoifggr",
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
  secure: true,
});

const UploadImageToCloud = async (file, oldImage) => {
  try {
    if (!oldImage) {
      const splitUrl = file.toString().split("/");
      const image_id = splitUrl[splitUrl.length - 1].split(".")[0];
      await cloudinary.v2.uploader.destroy(image_id);
    }

    const base64 = file.toString("base64");
    const imagePath = "data:image/png;base64," + base64;
    const url = await cloudinary.v2.uploader.upload(imagePath, {
      public_id: "IMG_" + Date.now(),
      resource_type: "auto",
    });

    return url.url;
  } catch (error) {
    console.log(error);
    return "";
  }
};

export default UploadImageToCloud;
