const logger = require("./../../../util/logger");
const Organization = require("../model/Organization");
const { where } = require("../model/User");

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
exports.createOrganization = async (req, res, next) => {
  const formData = req.body;
  // Generating random number between 1 and 7
  const number = randomIntFromInterval(1, 7);
  try {
    const organization = new Organization({
      ...formData,
      img: `assets/images/organization_defaults/${number}.jpg`,
      createdBy: req.userData.id,
      owner: req.userData.id,
    });
    await organization.save();
    res.status(201).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, errorMessage: error.message });
  }
};

exports.getOrganizations = async (req, res, next) => {
  try {
    const ownedOrganizations = await Organization.find({
      owner: req.userData.id,
    });
    const sharedOrganizations = await Organization.find({
      "orgMembers.email": req.userData.email,
    });
    res.status(200).send({
      success: true,
      ownedOrganizations: [...ownedOrganizations],
      sharedOrganizations: [...sharedOrganizations],
    });
  } catch (error) {
    res.status(500).send({ success: false, errorMessage: error.message });
  }
};
