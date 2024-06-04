import * as chai from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { environment } from "../src/config/config.js"

const { expect } = chai;
const requester = supertest('http://localhost:3000');

describe('Pruebas con supertest sobre API de Sesiones', function() {
    this.timeout(10000); // Configurar timeout para todos los tests
    let cookie;
    let transportStub;

    before(async () => {
        await mongoose.connect(environment.mongoUrlTest);
        // Stub para simular el envío de correo electrónico
    });

    beforeEach(async () => {
        if (mongoose.connection.collections.users) {
            await mongoose.connection.collections.users.drop();
        }
    });


    after(async () => {
        await mongoose.disconnect();
    });

    it('Debería registrar un nuevo usuario', async function() {
        const userData = {
            first_name: 'Testudines',
            last_name: 'Jujus',
            age: 56,
            email: 'testuser@example.com',
            password: 'testpassword',
        };

        const res = await requester.post('/register').send(userData);
        expect(res.status).to.equal(200);
    });
 
    it('Debería iniciar sesión con credenciales válidas', async function() {
        const userData = {
            first_name: 'usuario',
            last_name: 'testUser',
            age: 45,
            email: 'testuser@example.com',
            password: 'testpassword',
        };

        // Simula registrar al usuario antes de iniciar sesión
        await requester.post('/register').send(userData);

        const res = await requester.post('/login').send(userData);
        expect(res.status).to.equal(200);
        
    });

    it('Debería enviar la cookie que contiene el usuario', async function() {

        const cookie = {
            name: 'cookie_de_chocolate',
            value: 'valor100pesos'
        };

        const res = await requester.get('/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);
        expect(res.status).to.equal(200);
    });


    it('Debería cerrar sesión ', async function() {
        const res = await requester.get('/logout');
        expect(res.status).to.equal(200);
    });

    it('Debería cambiar exitosamente el rol del usuario', async function() {
        const userId = 'user123';
        const newRole = 'premium'; // Puede ser 'user' o 'premium'

        const res = await requester.put(`/premium/${userId}`).send({ role: newRole });
        expect(res.status).to.equal(200);
    });

    
});
