const express = require("express");
const path = require("path");
const isAuth = require("../controller/isAuth");
const logger = require("./../../../util/logger");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const translate = require("../../../util/translate");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
});
var s3 = new aws.S3();

const controller = require("./../controller/user");

const fileStorage = multerS3({
  s3: s3,
  bucket: process.env.MULTER_S3_BUCKET,
  // acl: "public-read", // not using it anymore because giving access to S3 by vrating user and assigning user to group with policy.
  key: function (req, file, cb) {
    logger.log("file");
    logger.log(file);
    var newFileName =
      new Date().toDateString() +
      "-" +
      new Date().getTime() +
      "-" +
      file.originalname;
    var fullPath = "images/display_picture/" + newFileName;
    logger.log(fullPath);
    cb(null, fullPath);
  },
});

const fileFilter = (req, file, cb) => {
  logger.log("File mimetype");
  logger.log(file.mimetype);
  logger.log(file);
  return cb(null, true);
};

var upload = multer({ storage: fileStorage, fileFilter: fileFilter });
const router = express.Router();
const i18n = translate.getI18n(
  path.join(__dirname, "..", "translations", "user")
);

router.use(i18n.init);
router.get("/user-data", isAuth, controller.userData);
router.post("/update-user-data", isAuth, controller.updateUserData);
router.post(
  "/update-preferences-data",
  isAuth,
  controller.updatePreferencesData
);
router.post(
  "/image-upload",
  isAuth,
  upload.single("file"),
  controller.imageUpload
);

exports.router = router;
