


import UserRepository from '../repositories/userRepository.js';
import multer from 'multer';

const userRepository = new UserRepository();

const upload = multer({
    // Configure storage location and filename generation
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'multer/uploads'); // All uploaded files will be saved in the "uploads" directory
        },
        filename: function (req, file, cb) {
            // Use original filename with a timestamp to avoid conflicts
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
        }
    })
});

/* const upload = multer({ storage }); */

const UserController = {

    // Obtener todos los usuarios
    getAllUsers: async (req, res) => {
        try {
            const users = await userRepository.getAllUsers();
            const userSummaries = users.map(user => ({
                name: user.first_name && user.last_name,
                email: user.email,
                role: user.role
            }));
            console.log("users: ", users)
            res.status(200).json(userSummaries);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los usuarios' });
        }
    },


    deleteInactiveUsers: async (req, res) => {
        try {
            const { date } = req.body;
            const thresholdDate = new Date(date);

            const inactiveUsers = await userRepository.getInactiveUsers(thresholdDate);

            const emailPromises = inactiveUsers.map(user =>
                nodemailerService.sendMail(
                    user.email,
                    'Cuenta eliminada por inactividad',
                    'Su cuenta ha sido eliminada por inactividad.'
                )
            );
            await Promise.all(emailPromises);

            await userRepository.deleteInactiveUsers(thresholdDate);

            res.status(200).json({ message: 'Usuarios inactivos eliminados' });
        } catch (error) {
            console.error('Error al eliminar usuarios inactivos:', error);
            res.status(500).json({ error: 'Error al eliminar usuarios inactivos' });
        }
    },

    // Actualizar rol del usuario
    updateUserRole: async (req, res) => {
        try {
            const { uid, newRole } = req.body;
            const updatedUser = await userRepository.updateUserRole(uid, newRole);

            res.status(200).json({ message: 'Rol del usuario actualizado', user: updatedUser });
        } catch (error) {
            console.error('Error al actualizar el rol del usuario:', error);
            res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
        }
    },

    // Eliminar usuario
    deleteUser: async (req, res) => {
        try {
            const { uid } = req.params;
            await userRepository.deleteUser(uid);
            res.status(200).json({ message: 'Usuario eliminado' });
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            res.status(500).json({ error: 'Error al eliminar el usuario' });
        }
    },
    // Renderizar la vista de gestión de usuarios
    renderManageUsersView: async (req, res) => {
        try {
            const users = await userRepository.getAllUsers();
            console.log(users)

            const context = {
                users: users,
                style: "style.css"
            };

            res.render('manageUsers', context);
        } catch (error) {
            res.status(500).json({ error: 'Error al renderizar la vista de gestión de usuarios' });
        }
    },
    updateToPremium: async (req, res) => {
        try {
            const userId = req.params.uid;
            const user = await userRepository.getUserById(userId);

            if (!user.documents.some(doc => doc.name === 'Identificación') ||
                !user.documents.some(doc => doc.name === 'Comprobante de domicilio') ||
                !user.documents.some(doc => doc.name === 'Comprobante de estado de cuenta')) {
                return res.status(400).json({ message: 'El usuario no ha cargado todos los documentos requeridos' });
            }

            await userRepository.updateUserRole(userId, 'premium');

            res.status(200).json({ message: 'Usuario actualizado a premium correctamente' });
        } catch (error) {
            console.error('Error al actualizar usuario a premium:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    uploadDocuments: upload.fields([
        { name: 'identification', maxCount: 1 },
        { name: 'proofOfAddress', maxCount: 1 },
        { name: 'bankStatement', maxCount: 1 }
    ]),
};

export default UserController;

