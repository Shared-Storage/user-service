const logger = require("./../../../util/logger");
const User = require("../model/User");
const { usersActiveSubscriptions } = require("./payments");

exports.userData = async (req, res, next) => {
  const userData = req.userData;
  logger.log("userData");
  logger.log(userData);
  try {
    const response = await User.findById(userData.id);
    const { customer, ...paymentsObject } = response.payments; // paymentsObject will have all the properties of payments except customer
    const activeSubscriptions = await usersActiveSubscriptions(
      response?.payments?.customer?.id
    );
    logger.log("Sending active subscriptions from activeSubscriptions")
    logger.log(activeSubscriptions)

    res.status(200).json({
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      imageUrl: response.imageUrl,
      bio: response.bio,
      emailVerified: response.emailVerified,
      preferences: response.preferences,
      payments: paymentsObject,
      subscriptions: activeSubscriptions,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};

exports.updateUserData = async (req, res, next) => {
  logger.log("req.userData");
  logger.log(req.userData);
  logger.log("req.body");
  logger.log(req.body);
  try {
    await User.updateOne(
      {
        _id: req.userData.id,
      },
      {
        ...req.body,
      }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).send({
      success: false,
      errorMessage: err.message,
    });
  }
};

exports.imageUpload = (req, res, next) => {
  logger.log("req.file");
  logger.log(req.file);
  const data = {
    filename: req.file.key,
    fileLocation: req.file.location,
    originalname: req.file.originalname,
  };
  logger.log(data);
  res.status(200).json({ success: true, data: data });
};

exports.updatePreferencesData = async (req, res, next) => {
  logger.log("req.userData");
  logger.log(req.userData);
  logger.log("req.body");
  logger.log(req.body);
  try {
    await User.updateOne(
      {
        _id: req.userData.id,
      },
      {
        preferences: req.body,
      }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).send({
      success: false,
      errorMessage: err.message,
    });
  }
};
