import express from 'express';
import UserController from '../controllers/userPremController.js';
import { isPremium } from "../middlewares/auth.middleware.js"

const userRouter = express.Router();


userRouter.get('/', UserController.getAllUsers);

/* Eliminar usuarios inactivos */
userRouter.delete('/inactive', UserController.deleteInactiveUsers);
userRouter.delete('/:uid', UserController.deleteUser);  
userRouter.put('/rol', UserController.updateUserRole);

/* Vista para visualizar; no hace falta filtrar por admin porque ya esta filtrado por el login*/
userRouter.get('/manage', UserController.renderManageUsersView);

userRouter.put('/premium/:uid', isPremium, UserController.updateToPremium);

/* Implementacion para subir doc. */
userRouter.get('/:uid/documents', UserController.uploadDocuments, (req, res) => {
    const user = req.session.user;
    res.render("documents", {
        user,
        style: "style.css",
    });
});



export default userRouter
                