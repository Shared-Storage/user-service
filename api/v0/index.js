const express = require("express");
const router = express.Router();

const genericRoute = require("./routes/generic");
const productRoute = require("./routes/product");

router.use("/working", genericRoute.router);
router.use("/product", productRoute.router);

exports.router = router;
