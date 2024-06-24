import UsersDao from '../daos/userDao.js';
import UserDTO from '../dto/userDto.js';
import { logger } from '../utils/logger.js';

class UserRepository {
    constructor() {
        this.usersDao = new UsersDao();
    }

    async getAllUsers() {
        return await this.usersDao.getAllUsers()
    }

    async getInactiveUsers(days) {
        const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return await this.usersDao.getAllUsers({
            where: {
                lastConnection: {
                    [Op.lt]: thresholdDate
                }
            }
        });
    }

    async deleteInactiveUsers(days) {
        const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return await this.usersDao.destroy(thresholdDate);
    }

    async updateUserRole(uid, newRole) {
        return await this.usersDao.updateUserRole(uid, newRole);
    }

    async deleteUser(uid) {
        return await this.usersDao.deleteUser(uid);
    }

    async createUser(userData) {
        return await this.usersDao.insert(userData.first_name, userData.last_name, userData.age, userData.email, userData.password);
    }

    async getUserByEmail(email, includePassword = false) {
        try {
            const user = await this.usersDao.getUserByEmail(email);
            if (!user) {
                return null;
            }

            if (includePassword) {
                return user; // Retorna el usuario completo con la contraseña
            } else {
                return new UserDTO(user); // Retorna el usuario como DTO
            }
        } catch (error) {
            throw new Error('Error al obtener el usuario por email');
        }
    }

    async getUserByCredentials(email, password) {
        const user = await this.usersDao.getUserByCreds(email, password);
        return user ? new UserDTO(user) : null;
        
    }

    async getUserById(id) {
        try {
            const user = await this.usersDao.getUserByID(id);
            return user ? new UserDTO(user) : null;
        } catch (error) {
            console.error(`Error al obtener usuario por ID ${id}:`, error);
            throw error; // Propagar el error para manejarlo en la capa superior si es necesario
        }
    }

    // Función para actualizar la contraseña del usuario
    async updatePassword (token, hashedPassword){
    try {
        // Aquí deberías buscar al usuario por el token o cualquier otro identificador único
        // y actualizar su contraseña con la nueva contraseña hasheada
        const user = await this.usersDao.updatePassword(token, hashedPassword);
        
        if (!user) {
            throw new Error("Usuario no encontrado o token inválido.");
        }

        return user;
    } catch (error) {
        logger.error("Error en UserRepository.updatePassword:", error);
    }
}
};


export default UserRepository;
