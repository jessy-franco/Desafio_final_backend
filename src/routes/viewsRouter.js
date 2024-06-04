import Router from "express";
import express from "express";
/* import UsersDao from "../daos/userDao.js"; */

const viewsRouter = express.Router();
/* registrarse */
viewsRouter.get("/register", (req,res)=>{
    res.render("register",{
        style: "style.css"
    })
})

viewsRouter.get("/login", (req, res) => {
    // Verificar si hay un token JWT en las cookies
    if (req.session.user) {
        // Redirigir al usuario si está autenticado
        return res.redirect("/api/products?inicioSesion=true");
    }

    // Si no hay un token JWT presente, renderizar la página de inicio de sesión
    res.render("login", {
        style: "style.css"
    });
});



export default viewsRouter ;
