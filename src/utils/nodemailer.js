import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    service: "gmail",
    /* port: 587, */
    auth:{
        user: "francojoa726@gmail.com",
        pass: "reemplazar por contraseña de aplicacion",
    }
})
export default transport 