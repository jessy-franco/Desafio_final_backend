import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth:{
        user: "francojoa726@gmail.com",
        pass: "nzus gulw gtkj kvew",
    }
})
export default transport 