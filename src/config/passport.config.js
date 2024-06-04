import GitHubStrategy from "passport-github2"
import passport from "passport"
import { logger } from "../utils/logger.js"
import LocalStrategy from "passport-local";
import {isValidPassword} from "../utils/utils.js"
import UserRepository from '../repositories/userRepository.js';
import UsersDao from "../daos/userDao.js"


const userRepository = new UserRepository();


const initializePassport = () => {
    
    /* funciones de serializacion y deserializacion */
        passport.serializeUser((user, done) => {
            done(null, user._id);
        });
    
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await userRepository.getUserById(id);
                done(null, user);
            } catch (error) {
                done(error);
            }
        });
        
        passport.use(
            "login",
            new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (username, password, done) => {
                try {
                    const user = await userRepository.getUserByEmail(username, true);
                    console.log("supone credenciales",user) /* lo trae a user "supone credenciales UserDTO {
                        id: new ObjectId('66041606c8e8474287537eaa'),
                        email: 'TeteunPliskerias@gmail.com',
                        firstName: 'tete',
                        lastName: 'pliskerias',
                        role: 'admin'
                      }" */
                    
                    if (!user) {
                        console.log("El usuario no existe");
                        return done(null, false);
                    }
                    if (!isValidPassword(password, user.password)) {
                        console.log("Contraseña inválida");
                        return done(null, user);
                    }

                    console.log("Usuario autenticado con éxito");
                    return done(null, user);
                } catch (error) {
                    console.log("Error en la autenticación:", error);
                    return done(error);
                }
            })
        );
    };
    /* sesion con github */
    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.8aacf63cf9714cdc",
        clientSecret: "10ef18ba5a7ed9a47c31afe4e5cda5f3036eac56",
        callbackUrl: "http://localhost:3000/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let email = profile._json.email;
            if (!email) {

                return done(null, false);
            }

            let user = await userRepository.getUserByEmail(profile._json.email);
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: "",
                    email: profile._json.email,
                    password: ""
                }
                let result = await UsersDao.insertGithub(newUser);
                done(null, result);
            }
            else {

                done(null, user);
            }
        } catch (error) {
            return done(error)
        }



    }))
    




export default initializePassport;