const express = require("express");
const controller = require("./../controller/generic");

const router = express.Router();

router.get("/", controller.get);

exports.router = router;
