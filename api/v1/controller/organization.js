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
    }).populate("owner");
    const sharedOrganizations = await Organization.find({
      "orgMembers.email": req.userData.email,
      "orgMembers.status": { $not: { $eq: "declined" } },
    }).populate("owner");
    res.status(200).send({
      success: true,
      ownedOrganizations: [...ownedOrganizations],
      sharedOrganizations: [...sharedOrganizations],
    });
  } catch (error) {
    res.status(500).send({ success: false, errorMessage: error.message });
  }
};

exports.acceptInvitation = async (req, res, next) => {
  const userEmail = req.userData.email;
  const organizationId = req.body.organizationId;

  try {
    // Find the organization
    const organization = await Organization.findById(organizationId);
    // Access organization members
    const organizationMembers = organization?.orgMembers;
    // Find the current user's object in organization members
    let currentUserIndex = undefined;
    const currentUserObject = organizationMembers.find((member, index) => {
      currentUserIndex = index;
      return member.email === userEmail;
    });
    // Modify currentUserObject
    const modifiedCurrentUserObject = {
      ...currentUserObject,
      status: "accepted",
    };

    // Array pop and push then save
    if (currentUserIndex != undefined) {
      const orgMembersArrayExceptCurrentMember = organizationMembers.filter(
        (member) => {
          return member != currentUserObject;
        }
      );

      const modifiedOrgMembersArray = [
        ...orgMembersArrayExceptCurrentMember,
        modifiedCurrentUserObject,
      ];

      // Updating organization object
      await Organization.updateOne(
        { _id: organizationId },
        { orgMembers: modifiedOrgMembersArray }
      );
      res.status(200).send({ success: true});
    } else {
      res.status(500).send({
        success: false,
        errorMessage: "Couldn't find user in organization members",
      });
    }
  } catch (error) {
    res.status(500).send({ success: false, errorMessage: error.message });
  }
};

exports.declineInvitation = async (req, res, next) => {
  const userEmail = req.userData.email;
  const organizationId = req.body.organizationId;

  try {
    // Find the organization
    const organization = await Organization.findById(organizationId);
    // Access organization members
    const organizationMembers = organization?.orgMembers;
    // Find the current user's object in organization members
    let currentUserIndex = undefined;
    const currentUserObject = organizationMembers.find((member, index) => {
      currentUserIndex = index;
      return member.email === userEmail;
    });
    // Modify currentUserObject
    const modifiedCurrentUserObject = {
      ...currentUserObject,
      status: "declined",
    };

    // Array pop and push then save
    if (currentUserIndex != undefined) {
      const orgMembersArrayExceptCurrentMember = organizationMembers.filter(
        (member) => {
          return member != currentUserObject;
        }
      );

      const modifiedOrgMembersArray = [
        ...orgMembersArrayExceptCurrentMember,
        modifiedCurrentUserObject,
      ];

      // Updating organization object
      await Organization.updateOne(
        { _id: organizationId },
        { orgMembers: modifiedOrgMembersArray }
      );
      res.status(200).send({ success: true});
    } else {
      res.status(500).send({
        success: false,
        errorMessage: "Couldn't find user in organization members",
      });
    }
  } catch (error) {
    res.status(500).send({ success: false, errorMessage: error.message });
  }
};
