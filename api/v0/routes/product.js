const express = require("express");
const controller = require("./../controller/product");

const router = express.Router();

router.post("/create", controller.create);
router.get("/get-all", controller.getAll);

exports.router = router;
