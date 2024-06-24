
import UserRepository from '../repositories/userRepository.js';
import passport from "passport";
import { generateTokenForPasswordReset } from "../utils/tokenPassUtils.js"
import { environment } from "../config/config.js";
import { createHash } from "../utils/utils.js"
import { logger } from "../utils/logger.js";
import { isAdmin } from '../middlewares/auth.middleware.js';
import { validateRegistrationData, validateLoginData } from './validators.js'
import Users from '../daos/models/userSchema.js';
import CartRepository from '../repositories/cartRepository.js';
import UserDTO from '../dto/userDto.js';
import {nodemailerService} from'../utils/nodemailer.js'

const userRepository = new UserRepository();
const cartRepository = new CartRepository();


const sessionController = {
    register: async (req, res) => {
        const userData = req.body;

        const validationResult = validateRegistrationData(userData);

        if (validationResult.error) {
            return res.status(400).json({ status: 400, error: validationResult.error });
        }

        let emailUsed = await userRepository.getUserByEmail(userData.email);


        if (emailUsed) {
            return res.status(400).json({ status: 400, error: "Email ya esta registrado" });
        }

        await userRepository.createUser(userData);
        return res.redirect("/login?Registro_con_exito_,_puede_iniciar_sesion");
    },

    login: async (req, res) => {
        // Verificar si el usuario existe

        const { email, password } = req.body;

        const validation = validateLoginData(email, password);
    
        if (!validation.success) {
            return res.redirect(`/login?error=${validation.error}`);
        }
    
        let user = await userRepository.getUserByCredentials(email, password);
        /* const user = await userRepository.getUserByEmail(email, true); */
        console.log("usuario:", user)
    
        if (!user) {
            return res.redirect("/login?error=Usuario_y/o_contraseña_incorrectas");
        }
         // Asegúrate de que user._id sea un ObjectId
    const userId = user.id;
    if (!userId || typeof userId !== 'object') {
        return res.redirect("/login?error=ID_de_usuario_inválido");
    }

    // Actualiza la última conexión
    const updatedUser = await Users.findOneAndUpdate(
        { _id: userId },
        { last_connection: new Date() },
        { new: true }
    );
    console.log("Usuario después de la actualización:", updatedUser);

    // Verifica si el usuario es nulo antes de acceder a sus propiedades
    if (!updatedUser) {
        return res.redirect("/login?error=Error_actualizando_la_última_conexión");
    }
    let userCart = await cartRepository.getCartById(user.cartId);

    if (!userCart) {
        userCart = await cartRepository.createCart();
        
        user.cartId = userCart._id; // Actualiza el cartId en la instancia de usuario
        await Users.findByIdAndUpdate(userId, { cartId: userCart._id }); // Actualiza el cartId en el usuario
        await user.save(); // Guarda los cambios en la instancia de usuario
        await cartRepository.saveCart(userCart);
    }


    req.session.user = {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        age: user.age,
        email: user.email,
        role: user.role,
        cartId: user.cartId ? user.cartId.toString() : userCart._id.toString()
    };
    console.log("userSession:",req.session.user)
    
        if (isAdmin(req, res)) { // Llama a la función isAdmin aquí
            console.log("Usuario es administrador:", UserDTO);
            return res.redirect("/api/products?isAdmin");
        } else {
            console.log("Usuario NO es administrador:", user);
            return res.redirect("/api/products?inicioSesion=true");
        }
        
    },

    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next(); // Si el usuario está autenticado, pasa al siguiente middleware
        }
        // Si el usuario no está autenticado, redirige a la página de inicio de sesión o devuelve un error
        res.status(401).json({ message: 'Usuario no autenticado' });
    },

    getCurrentUser: (req, res) => {
        try {
            // Obtener el usuario del objeto `req.user`
            const user = req.user; 
            // Enviar la respuesta con el usuario y un mensaje adicional
            res.status(200).json({ message: 'Usuario obtenido correctamente', user });

        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    logout: (req, res) => {
        req.session.destroy(err => {
            try{
                return res.redirect("/api/products?cierre_de_sesion_ok");
            }catch(err){
                res.send({ status: "Error al cerrar sesión", body: err })
            }
            
        })
    },
    authenticateWithGithub: (req, res, next) => {
        // Verificar si el usuario ya está autenticado
        if (req.isAuthenticated()) {
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
    /* Manejo de password */

    forgotPassword: async (req, res) => {
        try {
            
            const email = req.body.email;

            console.log('Correo electrónico recibido:', email);

            if (!email || !email.trim()) {
                return res.status(400).send('Por favor, proporciona una dirección de correo electrónico válida.');
            }

            // Genera el token para restablecer la contraseña
            const token = generateTokenForPasswordReset(req, email); // Esta función debe almacenar el token en la sesión

            // Configura las opciones del correo electrónico

            const result = await nodemailerService.sendMail(
                email,
                'Recuperación de Contraseña',
                '',
                `
                <div>
                    Haga clic en el siguiente enlace para restablecer su contraseña: 
                    <a href="http://${environment.HOST}:${environment.port}/resetPassword?token=${token}">
                        Restablecer Contraseña
                    </a>. El enlace expirará en 1 hora.
                    <img src="cid:dinoLogin"/>
                </div>`,
                [{
                    filename: "dinoLogin.jpg",
                    path: "/img/imgPages/dinoLogin.jpg",
                    cid: "dinoLogin"
                }]
            );
            console.log('Correo enviado: ', result); 
            res.send({ status: "success", result: "Email sent" });
        } catch (error) {
            console.log('Error al enviar el correo de recuperación de contraseña', error);
            
            return res.redirect("/login?Error_al_ enviar_mail");
            
        }
    },

    // Renderizar el formulario de reseteo de contraseña
    renderResetPasswordForm: (req, res) => {
        res.render("resetPassword");
    },

    // Procesar la solicitud de reseteo de contraseña
    resetPassword: async (req, res) => {
        try {
            const { email, newPassword, token } = req.body;

            // Verifica si se proporciona un token y una nueva contraseña
            if (!email || !newPassword || !token) {
                return res.status(400).send("Token y nueva contraseña son requeridos.");
            }

            // Decodificar el token para obtener información (si es necesario)

            // Hash de la nueva contraseña
            const hashedPassword = createHash(newPassword);

            // Actualizar la contraseña del usuario en la base de datos
            const result = await UserRepository.updatePassword(token, hashedPassword); // Implementa UserRepository para actualizar la contraseña

            // Redireccionar a la página de login después de restablecer la contraseña
            res.redirect("/login?resetSuccess=true"); // Ajusta según la ruta de tu aplicación

        } catch (error) {
            console.error("Error al restablecer la contraseña:", error);
            res.status(500).send("Error al restablecer la contraseña.");
        }
    },


    

};

export default sessionController;