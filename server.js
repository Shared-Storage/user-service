const app = require("./app");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV;
const ENABLE_DEBUG = process.env.ENABLE_DEBUG;
const ENABLE_EMAIL = process.env.ENABLE_EMAIL;
const mongoDbUrl = process.env.MONGODB_URL;

mongoose
  .connect(mongoDbUrl, { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT, () => {
      console.group("Environment details");
      console.table({
        Environment: ENV,
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
