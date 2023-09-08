const app = require("./app");

const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV;
const ENABLE_DEBUG = process.env.ENABLE_DEBUG;
const ENABLE_EMAIL = process.env.ENABLE_EMAIL;

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
