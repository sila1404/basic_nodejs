import Jimp from "jimp";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UploadImageToServer = async (file, oldImage) => {
  try {
    const imageBuffer = Buffer.from(file, "base64");
    const imageName = "IMG-" + Date.now() + ".png";
    const imagePath = `${__dirname}/../../assets/images/${imageName}`;

    const pngBuffer = await sharp(imageBuffer).toBuffer();
    const image = await Jimp.read(pngBuffer);
    if (!image) {
      return "Error Cover files";
    }
    image.write(imagePath);

    return imageName;
  } catch (error) {
    console.log(error);
    return "";
  }
};

export default UploadImageToServer;
