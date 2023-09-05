const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendgrid = require("@sendgrid/mail");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const logger = require("./../../../util/logger");
const User = require("../model/User");
const { createStripeCustomer, usersActiveSubscriptions } = require("./payments");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL;

exports.signup = async (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Generate token
    const emailVerificationToken = await generateToken();
    // Doing validation check
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (email == null || email == undefined || !email.match(validRegex))
      throw Error(res.__("ERROR_INVALID_EMAIL"));
    if (password == null || password == undefined || password.length < 6)
      throw Error(res.__("ERROR_INVALID_PASSWORD"));
    if (firstName == null || firstName == undefined || firstName.length < 1)
      throw Error(res.__("ERROR_INVALID_FIRSTNAME"));
    if (lastName == null || lastName == undefined || lastName.length < 1)
      throw Error(res.__("ERROR_INVALID_LASTNAME"));
    if (
      emailVerificationToken == null ||
      emailVerificationToken == undefined ||
      emailVerificationToken.length < 1
    )
      throw Error(res.__("ERROR_INVALID_EMAIL_VERIFICATION_TOKEN"));

    // Encrypting password
    const encryptedPassword = await bcrypt.hash(password, 12);
    const emailVerified = false;
    try {
      // creating stripe customer
      const customer = await createStripeCustomer(email, firstName, lastName);
      // Accessing Mongoose model
      const user = new User({
        firstName,
        lastName,
        email,
        password: encryptedPassword,
        emailVerificationToken,
        emailVerificationTokenExpiry: new Date(Date.now() + 3600000),
        emailVerified,
        payments: { customer: customer },
      });
      // Saving in db
      await user.save();
    } catch (err2) {
      logger.error(err2);
      return res.status(500).send({
        success: false,
        errorMessage: err2.message,
      });
    }
    // Send Email for verification
    const msg = {
      to: email,
      from: res.__("BUG_TRACKER_EMAIL"),
      subject: res.__("EMAIL_VERIFICATION_SUBJECT"),
      html: `<strong>This is a verification email.</strong><br/><p>Click the following link to verify your email. <a href='${FRONTEND_URL}/verify-email/${emailVerificationToken}'>verify email</a><br/>This is valid only for 60 minutes.</p>`,
    };
    await sendEmail(msg);
    // Return back response
    return res.status(201).send({
      success: true,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).send({
      success: false,
      errorMessage: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  // Extracting email and password
  const email = req.body.email;
  const password = req.body.password;
  try {
    // Find user
    const user = await User.findOne({
      email: email,
    });
    if (user) {
      // Verify password
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        // Retrieve user's subscriptions
        const subscriptions = await usersActiveSubscriptions(
          user?.payments?.customer?.id
        );
        logger.log("Received active Subscriptions");
        logger.log(subscriptions);
        

        // Email and password matched
        const { customer, ...paymentsObject } = user.payments;
        const userData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          bio: user.bio,
          emailVerified: user.emailVerified,
          preferences: user.preferences,
          payments: paymentsObject,
          subscriptions: subscriptions, 
          // Can't send many objects in "subscriptions" otherwise JWT token becomes too large
        };
        // Create access token
        const token = jwt.sign(userData, process.env.TOKEN_SECRET, {
          expiresIn: process.env.TOKEN_EXPIRY,
        });
        return res.status(200).json({ success: true, token, userData });
      } else {
        return res.status(400).send({
          success: false,
          errorMessage: res.__("ERROR_WRONG_PASSWORD"),
        });
      }
    } else {
      return res.status(400).send({
        success: false,
        errorMessage: res.__("ERROR_USER_NOT_FOUND"),
      });
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).send({
      success: false,
      errorMessage: err.message,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  // Extract email from request
  const email = req.body.email;
  // Generate token
  const passwordResetToken = await generateToken();
  // Update user
  try {
    const user = await User.findOne({
      email: email,
    });

    if (user) {
      await User.updateOne(
        {
          _id: user.id,
        },
        {
          passwordResetToken: passwordResetToken,
          passwordResetTokenExpiry: new Date(Date.now() + 3600000),
        }
      );

      // Send Email for verification
      const msg = {
        to: email,
        from: res.__("BUG_TRACKER_EMAIL"),
        subject: res.__("EMAIL_FORGOT_PASSWORD_SUBJECT"),
        html: `<strong>This is a password reset email.</strong><br/><p>Click the following link to reset your password. <a href='${FRONTEND_URL}/verify-forgot-password/${passwordResetToken}'>Reset password</a><br/>This is valid only for 60 minutes.</p>`,
      };
      await sendEmail(msg);
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({
        success: false,
        errorMessage: res.__("ERROR_EMAIL_NOT_REGISTERED"),
      });
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).send({
      success: false,
      errorMessage: res.__("ERROR_CANT_SEND_PASSWORD_RESET_EMAIL"),
    });
  }
};

exports.resendEmailVerification = async (req, res, next) => {
  // Extract email from request
  const email = req.body.email;
  // Generate token
  const emailVerificationToken = await generateToken();
  // Update user
  try {
    await User.updateOne(
      {
        email: email,
      },
      {
        emailVerificationToken: emailVerificationToken,
        emailVerificationTokenExpiry: new Date(Date.now() + 3600000),
      }
    );
    // Send Email for verification
    const msg = {
      to: email,
      from: res.__("BUG_TRACKER_EMAIL"),
      subject: res.__("EMAIL_VERIFICATION_SUBJECT"),
      html: `<strong>This is a verification email.</strong><br/><p>Click the following link to verify your email. <a href='${FRONTEND_URL}/verify-email/${emailVerificationToken}'>verify email</a><br/>This is valid only for 60 minutes.</p>`,
    };
    await sendEmail(msg);
    return res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    return res.status(500).send({
      success: false,
      errorMessage: res.__("ERROR_SENDING_VERIFICATION_EMAIL"),
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  // Extract token
  const tokenToBeVerified = req.body.tokenToBeVerified;
  // Get the user
  let user = await User.findOne({
    emailVerificationToken: tokenToBeVerified,
  });
  // Check if emailVerificationTokenExpiry is passed and if user was extracted
  if (
    user &&
    Date.now() < moment(user.emailVerificationTokenExpiry).toDate().getTime()
  ) {
    // Update user
    try {
      await User.updateOne(
        {
          _id: user.id,
        },
        { emailVerified: true }
      );
      return res.status(200).send({ success: true });
    } catch (err) {
      return res.status(500).send({
        success: false,
        errorMessage: res.__("ERROR_UPDATING_THE_USER"),
      });
    }
  } else {
    return res.status(400).send({
      success: false,
      errorMessage: res.__("ERROR_TOKEN_EXPIRED"),
    });
  }
};

exports.verifyForgotPassword = async (req, res, next) => {
  // Extracting token and password
  const tokenToVerify = req.body.tokenToVerify;
  const newPassword = req.body.newPassword;
  // Get the user
  let user = await User.findOne({
    passwordResetToken: tokenToVerify,
  });

  // Check if emailVerificationTokenExpiry is passed and if user was extracted
  if (
    user &&
    Date.now() < moment(user.passwordResetTokenExpiry).toDate().getTime()
  ) {
    if (
      newPassword == null ||
      newPassword == undefined ||
      newPassword.length < 6
    )
      return res.status(400).send({
        success: false,
        errorMessage: res.__("ERROR_INVALID_PASSWORD"),
      });
    // Update user
    try {
      const encryptedPassword = await bcrypt.hash(newPassword, 12);

      await User.updateOne(
        {
          _id: user.id,
        },
        {
          password: encryptedPassword,
          passwordResetToken: null,
          passwordResetTokenExpiry: null,
        }
      );
      return res.status(201).send({ success: true });
    } catch (err) {
      logger.error(err);
      return res.status(500).send({
        success: false,
        errorMessage: res.__("ERROR_UPDATING_THE_USER"),
      });
    }
  } else {
    return res.status(400).send({
      success: false,
      errorMessage: res.__("ERROR_TOKEN_EXPIRED"),
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  // Update user's password
  const userId = req.userData.id;
  logger.log("userId: " + userId);
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  logger.groupCollapsed("update password method body data");
  logger.log("currentPassword: " + currentPassword);
  logger.log("newPassword: " + newPassword);
  logger.groupEnd();

  // Check if current password is correct
  try {
    // Find user
    const user = await User.findOne({
      _id: userId,
    });
    if (user) {
      // Verify password
      const matched = await bcrypt.compare(currentPassword, user.password);
      if (matched) {
        // Current password matched
        logger.log("Password matched");

        // Validating new password
        if (
          newPassword == null ||
          newPassword == undefined ||
          newPassword.length < 6
        )
          throw Error(res.__("ERROR_INVALID_CURRENT_PASSWORD"));

        // Encrypting password
        const encryptedPassword = await bcrypt.hash(newPassword, 12);
        // Updating User with new encrypted password
        try {
          await User.updateOne(
            {
              _id: userId,
            },
            {
              password: encryptedPassword,
            }
          );
          return res.status(201).send({ success: true });
        } catch (err) {
          logger.error(err);
          return res.status(500).send({
            success: false,
            errorMessage: res.__("ERROR_UPDATING_THE_USER"),
          });
        }
      } else {
        // Current password didn't match
        logger.log("Password haven't matched");
        res.status(400).send({
          success: false,
          errorMessage: res.__("ERROR_WRONG_CURRENT_PASSWORD"),
        });
      }
    } else {
      // User not found
      logger.log("User not found");
      res.status(500).send({
        success: false,
        errorMessage: res.__("ERROR_USER_NOT_FOUND"),
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      errorMessage: error.message,
    });
  }
};

sendEmail = async (msg) => {
  try {
    process.env.ENABLE_EMAIL == "true" ? await sendgrid.send(msg) : null;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

generateToken = async () => {
  try {
    const buffer = await new Promise((resolve, reject) => {
      crypto.randomBytes(32, function (error, bufferValue) {
        if (error) {
          reject(res.__("ERROR_GENERATING_TOKEN"));
        }
        resolve(bufferValue);
      });
    });
    const token = buffer.toString("hex");
    return token;
  } catch (error) {
    return null;
  }
};
