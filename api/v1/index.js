const express = require("express");
const router = express.Router();

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const supportRoute = require("./routes/support");
const paymentsRoute = require("./routes/payments");


router.use("/auth", authRoute.router);
router.use("/user", userRoute.router);
router.use("/support", supportRoute.router);
router.use("/payments", paymentsRoute.router);

exports.router = router;
