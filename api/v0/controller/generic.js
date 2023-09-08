exports.get = (req, res, next) => {
  res.send({ working: true, env: process.env.ENV });
};
