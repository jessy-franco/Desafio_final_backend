
import express from "express";
import passport from "passport";
import sessionController from "../controllers/SessionController2.js";

const router = express.Router();

router.post("/register", sessionController.register);

router.post("/login", passport.authenticate("login", {
    failureRedirect: "/login?error=Usuario_y/o_contraseña_incorrectas"
}), sessionController.login);

router.get("/current", sessionController.ensureAuthenticated, sessionController.getCurrentUser);
router.get("/logout", sessionController.logout);
router.get("/github", sessionController.authenticateWithGithub);
router.get("/githubcallback", sessionController.githubCallback);
router.get("/logout/github", sessionController.logoutGithub);
router.get("/current", sessionController.ensureAuthenticated, sessionController.getCurrentUser);
router.post('/mail', sessionController.forgotPassword);
router.get("/reset-password", sessionController.renderResetPasswordForm);
router.post("/reset-password", sessionController.resetPassword);

export default router;
