const jwt = require("jsonwebtoken");
const logger = require("./../../../util/logger.js");

module.exports = (req, res, next) => {
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (err) {
    logger.log("ERI");
    logger.error(err)
    if (err.message === "jwt expired")
      return res.status(400).send({ errorMessage: "jwt expired" });
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    logger.error("Not Authenticated")
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  req.userData = decodedToken;
  next();
};
