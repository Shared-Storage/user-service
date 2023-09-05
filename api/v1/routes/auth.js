const express = require("express");
const controller = require("./../controller/auth");
const isAuth = require("../controller/isAuth");
const path = require("path");
const translate = require("../../../util/translate");

const router = express.Router();

const i18n = translate.getI18n(path.join(__dirname, "..", "translations", "auth"));

router.use(i18n.init);

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/resend-email-verification", controller.resendEmailVerification);
router.post("/verify-email", controller.verifyEmail);
router.post("/verify-forgot-password", controller.verifyForgotPassword);
router.post("/update-password", isAuth, controller.updatePassword);

exports.router = router;
