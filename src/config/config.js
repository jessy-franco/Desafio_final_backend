import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

/* Obtener la ruta del directorio del archivo actual */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Cargar desde el archivo .env */
const loadEnv = (envType) => {
    const envPath = envType === 'prod' ? '.env.prod' : '.env.dev';
    const envFilePath = path.resolve(__dirname, `../${envPath}`);
    dotenv.config({ path: envFilePath });
    console.log(`esto es:${envFilePath}`)
    /* console.log('Loaded Environment Variables:', process.env); */
};

// Cargar las variables de entorno al inicio de la aplicación
const envType = process.argv[2] === 'prod' ? '.env.prod' : '.env.dev';
loadEnv(envType);
console.log(`esto es el tipo: ${envType}`)

// Exportar las variables de entorno configuradas
export const environment = {
    port: process.env.PORT || 3000, // Puerto predeterminado 3000 si no está definido
    HOST: process.env.HOST,
    mongoUrl: process.env.MONGO_URL,
    mongoUrlTest: process.env.MONGO_URL_TEST,
    adminName: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    jwtSecret: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
};

