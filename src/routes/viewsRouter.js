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
    if (req.session.user) {
        return res.redirect("/api/products?inicioSesion=true");
    }

    
    res.render("login", {
        style: "style.css"
    });
});



export default viewsRouter ;
