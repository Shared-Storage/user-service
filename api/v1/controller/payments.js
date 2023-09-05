const stripe = require("stripe")(process.env.STRIPE_SECRET);
const logger = require("../../../util/logger");
const User = require("../model/User");
const PaymentsPlan = require("../model/PaymentsPlan");

exports.createStripeCustomer = async (email, fname, lname) => {
  logger.groupCollapsed("Arguments");
  logger.log("fname:" + fname);
  logger.log("lname:" + lname);
  logger.log("email:" + email);
  logger.groupEnd();

  try {
    const customer = await stripe.customers.create({
      email: email,
      name: fname + " " + lname,
    });
    logger.log("customer");
    logger.log(customer);
    return customer;
  } catch (error) {
    logger.error(error);
    throw Error(error.message);
  }
};
exports.userSubscriptions = async (customerId) => {
  logger.log("Customer id: " + customerId);
  if (customerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });
      logger.log("subscriptions");
      logger.log(subscriptions);
      return subscriptions;
    } catch (error) {
      logger.error(error);
      throw Error(error.message);
    }
  }
};
exports.usersActiveSubscriptions = async (customerId) => {
  logger.log("Customer id: " + customerId);
  if (customerId) {
    try {
      const activeSubscriptions = (
        await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
        })
      ).data;

      logger.log("Active subscription subscriptions");
      logger.log(activeSubscriptions);
      return activeSubscriptions;
    } catch (error) {
      logger.error(error);
      throw Error(error.message);
    }
  }
};

const extractCustomerID = async (userId) => {
  const user = await User.findById(userId);
  return user.payments.customer.id;
};
const extractPriceID = async (subscriptionPlanTitle) => {
  try {
    const plan = await PaymentsPlan.findOne({ title: subscriptionPlanTitle });
    return plan.priceId;
  } catch (err) {
    logger.error(err);
    throw Error(err.message);
  }
};

exports.updateBillingDetails = async (req, res, next) => {
  const billingDetails = req.body;

  // Extract customer ID
  const customerId = await extractCustomerID(req.userData.id);
  try {
    // Update billing/shipping details on stripe customer
    const updatedStripeCustomer = await stripe.customers.update(customerId, {
      shipping: {
        name: billingDetails?.billingName,
        phone: billingDetails?.billingPhone,
        address: {
          line1: billingDetails?.billingAddress?.addressLineOne,
          line2: billingDetails?.billingAddress?.addressLineTwo,
          city: billingDetails?.billingAddress?.city,
          country: billingDetails?.billingAddress?.country,
          state: billingDetails?.billingAddress?.province,
          postal_code: billingDetails?.billingAddress?.zip,
        },
      },
    });

    // Update the database
    await User.updateOne(
      { _id: req.userData.id },
      {
        payments: {
          customer: updatedStripeCustomer,
          billingDetails: billingDetails,
        },
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      errorMessage: res.__("ERROR_UPDATE_BILLING_DETAILS"),
      error: err.message,
    });
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    const paymentPlans = await PaymentsPlan.find();

    const plansObjectArray = [];

    // Removing priceId from each plan object for security.
    paymentPlans.forEach((plan) => {
      let planObj = { ...plan };
      let planObjModified = planObj._doc;
      delete planObjModified.priceId;
      plansObjectArray.push(planObjModified);
    });
    logger.log("plansObjectArray");
    logger.log(plansObjectArray);
    return res.status(200).json({
      plans: plansObjectArray,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      errorMessage: res.__("ERROR_GET_PLANS"),
      error: err.message,
    });
  }
};

exports.createSubscription = async (req, res, next) => {
  logger.log("Create subscription method");
  // Extracting data from request
  const userId = req.userData.id;
  const membershipPlan = req.body.membershipPlan;
  // Extract customer id from user id
  const customerId = await extractCustomerID(userId);
  // Extract price id from membership plan
  const priceId = await extractPriceID(membershipPlan);

  try {
    // Create the subscription. Note we're expanding the Subscription's
    // latest invoice and that invoice's payment_intent
    // so we can pass it to the front end to confirm the payment
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { subscription: membershipPlan },
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ error: { message: error.message } });
  }
};
// exports.createSubscriptionWithPaymentMethod = async (req, res, next) => {
//   logger.log("Create subscription with payment method");
//   const paymentMethod = req.body.paymentMethod;
//   logger.log("Payment method: " + paymentMethod);
//   // Extracting data from request
//   const userId = req.userData.id;
//   const membershipPlan = req.body.membershipPlan;
//   // Extract customer id from user id
//   const customerId = await extractCustomerID(userId);
//   // Extract price id from membership plan
//   const priceId = await extractPriceID(membershipPlan);

//   try {
//     // Create the subscription. Note we're expanding the Subscription's
//     // latest invoice and that invoice's payment_intent
//     // so we can pass it to the front end to confirm the payment
//     const subscription = await stripe.subscriptions.create({
//       customer: customerId,
//       items: [
//         {
//           price: priceId,
//         },
//       ],
//       default_payment_method: paymentMethod,
//       payment_behavior: "error_if_incomplete",
//       payment_settings: { save_default_payment_method: "on_subscription" },
//       expand: ["latest_invoice.payment_intent"],
//       metadata: { subscription: membershipPlan },
//     });

//     res.status(200).json({
//       subscription: subscription,
//     });
//   } catch (error) {
//     logger.error(error);
//     return res.status(400).send({ error: { message: error.message } });
//   }
// };

exports.getProductFromId = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const product = await stripe.products.retrieve(productId);
    return res.status(200).json({ product });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      error: err.message,
      errorMessage: res.__("ERROR_GET_PRODUCT_FROM_ID"),
    });
  }
};

const cancelSubscriptionAtThePeriodEndMethod = async (res, subscriptionId) => {
  try {
    const deleted = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    logger.log(res.__("CANCEL_SUBSCRIPTION_AT_PERIOD_END_METHOD"));
    logger.log(deleted);
    return deleted;
  } catch (err) {
    logger.error(err);
    throw Error(res.__("ERROR_CANCEL_SUBS_PERIOD_END"));
  }
};
// const cancelSubscriptionMethod = async (subscriptionId) => {
//   const deleted = await stripe.subscriptions.cancel(subscriptionId);
//   logger.log("Cancel subscription method deleted value");
//   logger.log(deleted);
//   return deleted;
// };

const resumeSubscriptionMethod = async (res, subscriptionId) => {
  try {
    const resumed = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return resumed;
  } catch (err) {
    logger.error(err);
    throw Error(res.__("ERROR_RESUMING_SUBSCRIPTION"));
  }
};

exports.resumeSubscription = async (req, res, next) => {
  const subscriptionId = req.body.subscriptionId;
  try {
    const subscriptionObject = await resumeSubscriptionMethod(
      res,
      subscriptionId
    );
    logger.log("Resume Subscription response");
    logger.log(subscriptionObject);
    res
      .status(200)
      .json({ resumed: true, subscriptionObject: subscriptionObject });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      error: err.message,
      errorMessage: res.__("ERROR_RESUMING_SUBSCRIPTION"),
    });
  }
};

exports.cancelSubscription = async (req, res, next) => {
  const subscriptionId = req.body.subscriptionId;
  try {
    const subscriptionObject = await cancelSubscriptionAtThePeriodEndMethod(
      res, // For i18n
      subscriptionId
    );
    res
      .status(200)
      .json({ canceled: true, subscriptionObject: subscriptionObject });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      error: err.message,
      errorMessage: res.__("ERROR_CANCEL_SUBS"),
    });
  }
};
// exports.cancelSubscriptionImmediately = async (req, res, next) => {
//   const subscriptionId = req.body.subscriptionId;
//   const subscriptionObject = await cancelSubscriptionMethod(subscriptionId);
//   logger.log("cancelSubscription response");
//   logger.log(subscriptionObject);
//   res.status(200).json({ canceled: true });
// };

exports.updateSubscription = async (req, res, next) => {
  const subscriptionId = req.body.subscriptionId;
  const subscriptionItemId = req.body.subscriptionItemId;
  const membershipPlan = req.body.membershipPlan;
  try {
    const newPriceId = await extractPriceID(membershipPlan);
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          deleted: true,
        },
        {
          price: newPriceId,
        },
      ],
    });
    res.status(200).json({ updated: true, subscription: subscription });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      error: err.message,
      errorMessage: res.__("ERROR_UPDATE_SUBSCRIPTION"),
    });
  }
};
exports.updateSubscriptionPaymentMethod = async (req, res, next) => {
  const subscriptionId = req.body.subscriptionId;
  const paymentMethod = req.body.paymentMethod;
  const customerId = req.body.customerId;
  logger.log("subscriptionId: " + subscriptionId);
  logger.log("paymentMethod: " + paymentMethod);
  try {
    // Attach payment method to the customer
    const paymentMethodResponse = await stripe.paymentMethods.attach(
      paymentMethod,
      { customer: customerId }
    );
    logger.log("Payment method response");
    logger.log(paymentMethodResponse);
    // Update default payment method of a subscription
    const response = await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethod,
    });
    logger.log("response");
    logger.log(response);
    res.status(200).json({ updated: true });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({
      errorMessage: res.__("ERROR_SUBSCRIPTION_PAYMENT_METHOD"),
      error: err.message,
    });
  }
};

exports.retrievePaymentMethod = async (req, res, next) => {
  const paymentMethodId = req.body.paymentMethodId;
  logger.log("paymentMethodId: " + paymentMethodId);
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    res.status(200).json({ paymentMethod: paymentMethod });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({
      errorMessage: res.__("ERROR_RETRIEVE_PAYMENT_METHOD"),
      error: err.message,
    });
  }
};

exports.getInvoicesForCustomer = async (req, res, next) => {
  try {
    const customerId = req.body.customerId;
    const invoices = await stripe.invoices.list({
      customer: customerId,
    });
    res.status(200).json({ invoices });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({
      errorMessage: res.__("ERROR_GET_CUSTOMERS_INVOICE"),
      error: err.message,
    });
  }
};
exports.createSetupIntent = async (req, res, next) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      automatic_payment_methods: { enabled: true },
    });
    return res.status(201).json({ ...setupIntent });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({
      errorMessage: res.__("ERROR_CREATE_SETUP_INTENT"),
      error: err.message,
    });
  }
};
