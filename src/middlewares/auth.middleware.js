
import jwt from 'jsonwebtoken';
import errorHandler from "../middlewares/errorMiddlewares.js"

export const isAdmin = (req, res, next) => {
    console.log("Cookies:", req.cookies);
    // Verificar si req.cookies está definido y contiene el token jwt
    if (!req.cookies || !req.cookies.jwt) {
        /* return res.status(403).json({ message: 'Acceso no autorizado, token inválido' }); */
        errorHandler({ code: 'ERROR_TOKEN', message: 'Acceso no autorizado, token inválido' }, req, res);
        return;
    }
    // Obtener el token JWT del encabezado de autorización
    const token = req.cookies.jwt

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            /* return res.status(401).json({ mensaje: 'Token inválido' }); */
            errorHandler({ code: 'ERROR_TOKEN', message: 'Acceso no autorizado, token inválido' }, req, res);
        return;
        }
        // Si el token es válido, puedes acceder a la información decodificada en `decoded`
        // Hacer lo que sea necesario con la información del usuario
        req.user = decoded; // Guardar la información decodificada en el objeto `req` para su uso posterior
        next();
    });
};
