import nodemailer from "nodemailer";
import { environment } from "../config/config.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        
        user: environment.USERMAIL,
        pass: environment.PASSNODEMAILER,
    }
});

const sendMail = async (to, subject, text, html, attachments = []) => {
    try {
        const info = await transport.sendMail({
            from: `"Sucurex" <${environment.USERMAIL}>`,
            to,
            subject,
            text,
            html,
            attachments
        });
        console.log("Correo enviado: ", info); // Añadido para depuración
        return info;
    } catch (error) {
        console.error("Error al enviar correo: ", error);
        return error;
    }
};

export const nodemailerService = {
    sendMail,
};