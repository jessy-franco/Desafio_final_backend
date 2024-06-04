


import UserRepository from '../repositories/userRepository.js';
import multer from 'multer';

const userRepository = new UserRepository();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profileImage') {
            cb(null, 'uploads/profiles');
        } else if (file.fieldname === 'productImage') {
            cb(null, 'uploads/products');
        } else {
            cb(null, 'uploads/documents');
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

const UserController = {
    updateToPremium: async (req, res) => {
        try {
            const userId = req.params.uid;
            const user = await userRepository.getUserById(userId);

            // Verificar si el usuario tiene los documentos requeridos cargados
            if (!user.documents.some(doc => doc.name === 'Identificación') ||
                !user.documents.some(doc => doc.name === 'Comprobante de domicilio') ||
                !user.documents.some(doc => doc.name === 'Comprobante de estado de cuenta')) {
                return res.status(400).json({ message: 'El usuario no ha cargado todos los documentos requeridos' });
            }

            // Actualizar el usuario a premium
            user.premium = true;
            await user.save();

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

