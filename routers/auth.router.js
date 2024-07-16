const express = require("express");
const passport = require("passport");
const CryptoJS = require('crypto-js')
const {
  loginSuccess,
  loginFailed,
  logout,
  checkUserInfo,
  forgotPassword,
  login,
  register,
  resetPassword,
  sendOTPResetPassword,
  getUserInfo,
  verifyRegistrationToken,
} = require("../controllers/auth.controller");
const {
  existingUserAccount,
} = require("../middlewares/validations/existingUserAccount");

const authRouter = express.Router();

authRouter.get("/login/success", loginSuccess);
authRouter.get("/login/failed", loginFailed);
authRouter.get("/get-user-info", getUserInfo);
authRouter.get("/forgot-password", forgotPassword);
authRouter.get("/check-user-info", checkUserInfo);
authRouter.post("/login", login);
authRouter.post("/register", existingUserAccount, register);
//Check info when registering an account(Phone number, email, username)
authRouter.post("/verify-registration", verifyRegistrationToken);
authRouter.post("/send-otp-reset-password", sendOTPResetPassword);
authRouter.post("/reset-password", resetPassword);

authRouter.get("/logout", logout);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    const stateObject = {
      success: true,
      service: "google",
      createdAt: new Date(),
    };

    const encryptedState = CryptoJS.AES.encrypt(
      JSON.stringify(stateObject),
      process.env.APP_SECRET_KEY
    ).toString();

    res.redirect(
      `${process.env.FRONTEND_URL}?state=${encodeURIComponent(encryptedState)}`
    );
  }
);

authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["public_profile", "email"] })
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: process.env.FRONTEND_URL,
    failureRedirect: "/login/failed",
  })
);

authRouter.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["public_profile", "email"] })
);

authRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: process.env.FRONTEND_URL,
    failureRedirect: "/login/failed",
  })
);

module.exports = authRouter;