import express from 'express';
import UserController from '../controllers/userPremController.js';
import { isPremium } from "../middlewares/auth.middleware.js"

const userRouter = express.Router();

userRouter.put('/premium/:uid', isPremium, UserController.updateToPremium);
// Endpoint para subir documentos
userRouter.get('/:uid/documents', UserController.uploadDocuments, (req, res) => {
    const user = req.session.user;
    res.render("documents", {
        user,
        style: "style.css",
    });
});

export default userRouter
                