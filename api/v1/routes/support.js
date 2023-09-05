const express = require("express");
const path = require("path");
const controller = require("./../controller/support");
const translate = require("../../../util/translate");

const router = express.Router();

const i18n = translate.getI18n(
  path.join(__dirname, "..", "translations", "support")
);

router.use(i18n.init);
router.post("/submit", controller.submit);

exports.router = router;
