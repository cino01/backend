const authController = require("../controllers/authController");
const userController = require("../controllers/usersController");
const contentCreation = require("../controllers/contentCreation");
const experienceController = require("../controllers/profileController");
const express = require("express");
const profileController=require('../controllers/profileController');
const { Experience } = require("../models/experienceModule");
const router = express.Router();
/// AUTHENTICATION PART ../../../../../.../

router.post("/signUp", authController.signUp);
router.get("/confirm/:token", authController.confirmRegistration);
router.post("/login", authController.login);
router.post("/signOut", authController.signOut);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

//// FIRST PAGE PART CVS
router.get("/", userController.getAllUsers);
// SEARCH ONE
router.patch(
  "/updateUserInfo",
  authController.protect,
  userController.updateUserInfo
);
router.patch(
  "/updateSkills",
  authController.protect,
  userController.updateUserInfo
);
router.patch(
  "/addExperience",
  authController.protect,
  experienceController.addExperience
);
router.patch(
  "/addEducations",
  authController.protect,
  experienceController.addEducations
);
router.patch(
  "/addLicence",
  authController.protect,
  experienceController.addlicences
);
router.patch(
  "/addCertification",
  authController.protect,
  experienceController.addCertification
);
router.patch(
  "/addLanguage",
  authController.protect,
  experienceController.addLanguage
);
router.delete('/deleteexperience',authController.protect,profileController.deleteExperience);
router.delete('/deleteeducation',authController.protect,profileController.deleteeducation);
router.delete('/deletelanguage',authController.protect,profileController.deletelanguage);
router.delete('/deletelicences',authController.protect,profileController.deletelicences);
router.delete('/deletecertification',authController.protect,profileController.deletesertification);
router.delete('/deleteskill',authController.protect,profileController.deleteskill);

/// MY PROFILE
router.get("/getMe", authController.protect, userController.getUser);
router.get('/allUsers',userController.getAllUsers);
module.exports = router;
