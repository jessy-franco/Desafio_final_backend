import nodemailer from "nodemailer";
import { environment } from "../config/config.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth:{
        user: environment.USERMAIL,
        pass: environment.PASSNODEMAILER,
    }
})
export default transport 