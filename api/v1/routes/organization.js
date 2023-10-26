const express = require("express");
const path = require("path");
const controller = require("./../controller/organization");
const translate = require("../../../util/translate");
const isAuth = require("../controller/isAuth");

const router = express.Router();

const i18n = translate.getI18n(
  path.join(__dirname, "..", "translations", "organization")
);

router.use(i18n.init);
router.post("/create-organization", isAuth, controller.createOrganization);
router.get("/get-organizations", isAuth, controller.getOrganizations);
router.post("/accept-invitation", isAuth, controller.acceptInvitation);
router.post("/decline-invitation", isAuth, controller.declineInvitation);

exports.router = router;
