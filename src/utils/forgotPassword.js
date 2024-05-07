import jwt from "jsonwebtoken";

function generateTokenForPasswordReset(email) {
    // Se puede incluir información adicional en el token, como el correo electrónico del usuario
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

export default generateTokenForPasswordReset