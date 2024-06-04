import express from 'express';
import UserController from '../controllers/userPremController.js';
import { isPremium } from "../middlewares/auth.middleware.js"

const userRouter = express.Router();

userRouter.put('/premium/:uid', isPremium, UserController.updateToPremium);
// Endpoint para subir documentos
userRouter.post('/:uid/documents', UserController.uploadDocuments);

export default userRouter
