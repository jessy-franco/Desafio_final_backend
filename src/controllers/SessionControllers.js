import jwt from "jsonwebtoken";
import UserRepository from '../repositories/userRepository.js';
import {isAdmin} from "../middlewares/auth.middleware.js"
import * as validators from './validators.js';
import passport from "passport";
import generateTokenForPasswordReset from "../utils/forgotPassword.js"
import transport from "../utils/nodemailer.js";


const userRepository = new UserRepository();

const sessionController = {
    register: async (req, res) => {
        const userData = req.body;

        const validationResult = validators.validateRegistrationData(userData);

        if (validationResult.error) {
            return res.status(400).json({ status: 400, error: validationResult.error });
        }

        let emailUsed = await UserRepository.getUserByEmail(userData.email);


        if (emailUsed) {
            return res.status(400).json({ status: 400, error: "Email ya esta registrado" });
        }

        await UserRepository.createUser(userData);
        return res.redirect("/login?Registro_con_exito_,_puede_iniciar_sesion");
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        const validation = validators.validateLoginData(email, password);

        if (!validation.success) {
            return res.redirect(`/login?error=${validation.error}`)
        }

        try {
            const user = await userRepository.getUserByCredentials(email, password);

            if (!user) {
                return res.redirect("/login?error=Usuario_y/o_contraseña_incorrectas");
            }
            

            // Verificar si el usuario es administrador
        if (isAdmin(user)) {
            let token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie("jwt", token, { signed: true, httpOnly: true, maxAge: 1000 * 60 * 60 });
            res.render("products", { isAdmin: true });
        } else {
            let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie("jwt", token, { signed: true, httpOnly: true, maxAge: 1000 * 60 * 60 });
            return res.redirect("/api/products?inicioSesion=true");
        }

        } catch (error) {
            console.error("Error al autenticar usuario:", error);
            res.redirect("/login?error=Ocurrió un error durante la autenticación");
        }
        
        
    },
    getCurrentUser: (req, res) => {
        try {
            // Obtener el usuario del objeto `req.user`
            const user = req.user; // El usuario ya es un UserDTO gracias al UserRepository
            res.status(200).json(user);

        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    logout: (req, res) => {
        res.clearCookie("jwt");
        return res.redirect("/home?cierre_de_sesion_ok")
    },
    authenticateWithGithub: (req, res, next) => {
        // Verificar si el usuario ya está autenticado
        if (req.isAuthenticated()) {
            /* Si el usuario ya está autenticado, redirigirlo a la página de productos con la señal de inicio de sesión */
            return res.redirect("/api/products?inicioSesion=true");
        }
        /* Si el usuario no está autenticado, continuar con el proceso de autenticación de GitHub */
        passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
    },
    githubCallback: async (req, res) => {
        try {
            // Intentar autenticar al usuario con Passport
            await new Promise((resolve, reject) => {
                passport.authenticate("github", (err, user) => {
                    if (err) {
                        // Si hay un error, rechazar la promesa con el error
                        return reject(err);
                    }
                    // Si el usuario se autentica correctamente, resolver la promesa con el usuario
                    resolve(user);
                })(req, res);
            });

            // Si llegamos a este punto, significa que el usuario se autenticó correctamente

            res.redirect("/api/products?inicioSesion=true");
        } catch (error) {
            // Si se produce un error durante la autenticación, manejarlo aquí
            console.error("Error durante la autenticación:", error);
            res.redirect("/login?error=Usuario_y/o_contraseña_incorrectas");
        }
    },
    logoutGithub: (req, res, next) => {
        req.logout(function (err) {
            if (err) {
                return next(err); // Manejar errores si ocurren
            }
            res.redirect('/login?Usuario_deslogueado'); // Redirigir al usuario a la página de inicio de sesión después de cerrar sesión correctamente
        });
    },
    check:(req, res) => {
        // Obtener el token JWT del encabezado de autorización
        const token = req.cookies.jwt
    
        if (!token) {
            return res.status(401).json({ message: 'Acceso no autorizado' });
        }
    
        // Verificar y decodificar el token JWT
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token inválido' });
            }
    
            // Verificar si el usuario es un administrador (puedes personalizar esta lógica según tus requisitos)
            const isAdmin = decoded.isAdmin;
    
            // Enviar una respuesta indicando si el usuario es un administrador o no
            res.json({ isAdmin });
        });
    },
    
    /* forgotPassword: async(req, res)=>{
        try {
            const token = generateTokenForPasswordReset(); // Generar token para el enlace de recuperación
    
            const mailOptions = {
                from: 'SucuRex@gmail.com',
                to:  req.body.email ,
                subject: 'Recuperación de Contraseña',
                html: `
                <div>
                Haga clic en el siguiente enlace para restablecer su contraseña: <a href="http://tudominio.com/resetPassword/${token}">Restablecer Contraseña</a>. El enlace expirará en 1 hora.
                <img src="cid:dinoLogin"/>
                </div>`,
                attachments:[{
                    filename:"dinoLogin.jpg",
                    path:"/img/imgPages/dinoLogin.jpg",
                    cid:"dinoLogin"
                }]
            };
    
            await transport.sendMail(mailOptions);
    
            res.send(`<script>alert('Correo de recuperación de contraseña enviado exitosamente.');</script>`);
        } catch (error) {
            console.error('Error al enviar el correo de recuperación de contraseña:', error);
            res.send(`<script>alert('Error al enviar el correo de recuperación de contraseña.');</script>`);
        }
    } */
    forgotPassword: async(req, res) => {
        /* try {
            // Verifica si se proporciona un correo electrónico
            const email = req.body.email;
            console.log('Correo electrónico recibido:', email);
            if (!email || !email.trim()) {
                return res.status(400).send('Por favor, proporciona una dirección de correo electrónico válida.');
            }
     */
            // Genera el token para restablecer la contraseña
            const token = generateTokenForPasswordReset();
    
            // Configura las opciones del correo electrónico
            
            const result = await transport.sendMail({
                from: 'SucuRex@gmail.com',
                to: email,
                subject: 'Recuperación de Contraseña',
                html: `
                <div>
                    Haga clic en el siguiente enlace para restablecer su contraseña: <a href="http://tudominio.com/resetPassword/${token}">Restablecer Contraseña</a>. El enlace expirará en 1 hora.
                    <img src="cid:dinoLogin"/>
                </div>`,
                attachments: [{
                    filename: "dinoLogin.jpg",
                    path: "/img/imgPages/dinoLogin.jpg",
                    cid: "dinoLogin"
                }]
            });
            
            res.send({status:"success",result: "Email sent"});
        /* } catch (error) {
            console.error('Error al enviar el correo de recuperación de contraseña:', error);
            res.send('Error al enviar el correo de recuperación de contraseña.');
        } */
    },
    
    toggleUserRole: async (req, res) => {
        try {
            const userId = req.params.uid;
            const newRole = req.body.role; // Puede ser 'user' o 'premium'
    
            // Verificar si el nuevo rol es válido
            if (newRole !== 'user' && newRole !== 'premium') {
                return res.status(400).json({ message: 'Rol de usuario no válido.' });
            }
    
            // Actualizar el rol del usuario en la base de datos
            await userService.updateUserRole(userId, newRole);
            res.status(200).json({ message: `Rol de usuario actualizado a ${newRole}.` });
        } catch (error) {
            console.error('Error al cambiar el rol de usuario:', error);
            errorHandler({ code: 'TOGGLE_USER_ROLE_ERROR', message: error.message }, req, res);
        }
    },
    
};

export default sessionController;




