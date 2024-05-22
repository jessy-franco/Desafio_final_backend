import GitHubStrategy from "passport-github2" 
import UsersDao from "../daos/userDao.js"
import passport from "passport"
import jwt from "passport-jwt"


const JwtStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt;
const cookieExtractor = req =>{
    let token = null;
            if (req && req.signedCookies) {
                token = req.signedCookies['jwt'];
            }
            return token;
}
const initializePassport = () => {
    passport.use("jwt", new JwtStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: "secret_jwt"
    }, async function (jwt_payload, done) {
        let userId = jwt_payload.id;
        let user = await UsersDao.getUserByID(userId);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }))


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

            let user = await UsersDao.getUserByEmail(profile._json.email);
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
}
export default initializePassport;