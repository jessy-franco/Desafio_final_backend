import Users from "./models/userSchema.js"
import { createHash, isValidPassword } from "../utils/utils.js"
import CustomError from "../middlewares/customError.js"
import EErrors from "../middlewares/enums.js";
import {
    generateUserErrorInfo,
} from "../middlewares/errorUsers.js";
import { logger } from "../utils/logger.js";




/* generamos consultas sobre los datos del usuario */
class UsersDao {
    async getAllUsers() {
        try {
            const users = await Users.find({});
            return users;
        } catch (error) {
            console.error("Error retrieving users:", error);
            return { error: "Error getting all users" };
        }
    }
    async getUserByEmail(email) {
        return await Users.findOne({ email })

    }

    async getUserByCreds(email, password) {
        const user = await Users.findOne({ email }).lean();

        if (user && isValidPassword(password, user.password)) {
            delete user.password; // No devolver la contraseña en el objeto de usuario
            return user;
        }

        return null;
    }


    async insert(first_name, last_name, age, email, password) {
        password = createHash(password); // Utilizar createHash de utils.js
        return await new Users({ first_name, last_name, age, email, password }).save();
    }

    async insertGithub(userObj) {
        const { first_name, last_name, age, email, password } = userObj;
        const newUserFields = {
            first_name: first_name || "",
            last_name: last_name || "",
            age: age || "",
            email: email || "",
            password: password || ""
        };
        try {
            const newUser = new Users(newUserFields);
            return await newUser.save();
        } catch (error) {
            console.error("Error al insertar usuario:", error);
            CustomError.createError({
                name: "Error de registro",
                cause: generateUserErrorInfo({ first_name, last_name, age, email }),
                message: "Error al insertar usuario",
                code: EErrors.INVALID_TYPES_ERROR
            })
        }
    }


    async getUserByID(id) {
        return await Users.findOne({ _id: id }, { first_name: 1, last_name: 1, age: 1, email: 1, password: 1 }).lean();
    };

    async destroy(thresholdDate) {
        try {
            const result = await Users.deleteMany({
                lastConnection: { $lt: thresholdDate }
            });
            return result;
        } catch (error) {
            logger.error("Error en UsersDao.destroy:", error);
            throw error;
        }
    }

    async updateUserRole(uid, newRole) {
        return await Users.updateOne({ _id: uid }, { role: newRole });
    }

    async deleteUser(uid) {
        return await Users.deleteOne({ _id: uid });
    }

    async updatePassword(token, hashedPassword) {
        try {
            const user = await Users.findOneAndUpdate(
                { resetToken: token }, // Filtra por el token de reseteo
                { password: hashedPassword, resetToken: null }, // Actualiza la contraseña y limpia el token de reseteo
                { new: true } // Devuelve el documento actualizado
            );

            return user;
        } catch (error) {
            logger.error("Error en usersDao.updatePassword:", error);
            throw error;
        }
    }


}

export default UsersDao;


