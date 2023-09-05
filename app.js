const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");
const logger = require("./util/logger");

const app = express();
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV;
const ENABLE_DEBUG = process.env.ENABLE_DEBUG;
const ENABLE_EMAIL = process.env.ENABLE_EMAIL;
const mongoDbUrl = process.env.MONGODB_URL;

const v0Routes = require("./api/v0/index");
const v1Routes = require("./api/v1/index");

var options = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: `${process.env.BACKEND_URL}/documentation/swagger-v1.json`,
        name: "v1",
      },
      {
        url: `${process.env.BACKEND_URL}/documentation/swagger-v0.json`,
        name: "v0",
      },
    ],
  },
};

// Middleware
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Authorization,Accept"
  );
  next();
});

app.use(express.static("./public"));

app.use((req, res, next) => {
  logger.log(`REQUEST URL: ${req.url} METHOD: ${req.method}`);
  next();
});
app.use("/v0", v0Routes.router);
app.use("/v1", v1Routes.router);
app.use("/", swaggerUi.serve, swaggerUi.setup(null, options));

mongoose
  .connect(mongoDbUrl, { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT, () => {
      console.group("Environment details");
      console.table({
        "Environment": ENV,
        "Debugging enabled": ENABLE_DEBUG,
        "Email enabled": ENABLE_EMAIL,
        Port: PORT,
      });
      console.groupEnd();
    });
  })
  .catch((err) => {
    logger.error(err);
  });
