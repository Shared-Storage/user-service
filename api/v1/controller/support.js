const logger = require("./../../../util/logger");
const Support = require("../model/Support");

exports.submit = async (req, res, next) => {
  const formData = req.body;
  logger.log("formData submit");
  logger.log(formData);

  try {
    const support = new Support({
      ...formData,
    });
    await support.save();
    res.status(201).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, errorMessage: error.message });
  }
};
