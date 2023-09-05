const express = require("express");
const controller = require("../controller/payments");
const isAuth = require("../controller/isAuth");
const path = require("path");
const translate = require("../../../util/translate");
const router = express.Router();

const i18n = translate.getI18n(path.join(__dirname, "..", "translations", "payments"));

router.use(i18n.init);
router.get("/get-plans", isAuth, controller.getPlans);
router.post("/update-billing-details", isAuth, controller.updateBillingDetails);
router.post("/create-subscription", isAuth, controller.createSubscription);
// router.post("/create-subscription-with-payment-method", isAuth, controller.createSubscriptionWithPaymentMethod);
// router.post("/create-customer-portal-session", isAuth, controller.createCustomerPortalSession);
router.post("/get-product-from-id", isAuth, controller.getProductFromId);
router.post("/cancel-subscription", isAuth, controller.cancelSubscription);
// router.post("/cancel-subscription-immediately", isAuth, controller.cancelSubscriptionImmediately);
router.post("/resume-subscription", isAuth, controller.resumeSubscription);
router.post("/update-subscription", isAuth, controller.updateSubscription);
router.post(
  "/update-subscription-payment-method",
  isAuth,
  controller.updateSubscriptionPaymentMethod
);
router.post(
  "/retrieve-payment-method",
  isAuth,
  controller.retrievePaymentMethod
);
router.post(
  "/get-invoices-for-customer",
  isAuth,
  controller.getInvoicesForCustomer
);
router.post("/create-setup-intent", isAuth, controller.createSetupIntent);

exports.router = router;
