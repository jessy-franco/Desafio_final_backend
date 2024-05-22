import * as chai from 'chai';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';
import UserRepository from '../src/repositories/userRepository.js';
import transport from "../src/utils/nodemailer.js";
import mongoose from 'mongoose';
import { environment } from "../src/config/config.js"

const { expect } = chai;
/* const expect = chai.expect; */
const requester = supertest('http://localhost:3000');

/* const dbUrl = mongoose.connect(environment.mongoUrlTest) */

describe('Pruebas con supertest sobre API de Sesiones', () => {
    let cookie;
    let transportStub;

    before(async function (done) {
        this.timeout(10000);
        await mongoose.connect(environment.mongoUrlTest, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, done);
        // Stub para simular el envío de correo electrónico
        transportStub = sinon.stub(transport, 'sendMail').resolves('Correo enviado correctamente');
    });

    beforeEach(async function (done) {
        if (mongoose.connection.collections.users) {
            await mongoose.connection.collections.users.drop(() => {
                done();
            });
        } else {
            done();
        }
        this.timeout(5000);
    });

    after(() => {
        // Restaurar el stub después de las pruebas
        transportStub.restore();
    });

    it('Debería registrar un nuevo usuario', async function () {
        const userData = {
            first_name: 'Testudines',
            last_name: 'Jujus',
            age: 56,
            email: 'testuser@example.com',
            password: 'testpassword',

        };

        const res = await requester.post('/api/sessions/register').send(userData);
        expect(res.status).to.equal(200);

    });

    it('Debería iniciar sesión con credenciales válidas', async function () {
        const userData = {
            email: 'testuser@example.com',
            password: 'testpassword',
        };

        // Simula registrar al usuario antes de iniciar sesión
        await UserRepository.createUser(userData);

        const res = await requester.post('/api/sessions/login').send(userData);
        const cookieResult = res.headers['set-cookie'][0]
        expect(cookieResult).to.be.ok;
        cookie = {
            name: cookieResult.split('=')[0],
            value: cookieResult.split('=')[1]
        }
        expect(res.status).to.equal(200);
        expect(cookie.name).to.be.ok;
        expect(cookie.value).to.be.ok;
    });

    it('Deberia enviar la cookie que contiene el usuario', async function () {
        const { _body } = await requester.get('/api/sessions/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);
        expect(_body.payload.email).to.be.eql('testuser@example.com');
    })

    it('debería obtener el usuario actual con un token JWT válido', async function () {
        // Genera un token JWT válido para un usuario
        const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await requester.get('/api/sessions/current').set('Authorization', `Bearer ${token}`);
        expect(res.status).to.equal(200);
    });

    it('debería cerrar sesión y limpiar la cookie JWT', async function () {
        const res = await requester.get('/api/sessions/logout');
        expect(res.status).to.equal(200);
    });

    it('debería cambiar exitosamente el rol del usuario', async function () {
        const userId = 'user123';
        const newRole = 'premium'; // Puede ser 'user' o 'premium'

        const res = await requester.put(`/api/sessions/premium/${userId}`).send({ role: newRole });
        expect(res.status).to.equal(200);
    });

    it('debería enviar el correo electrónico de recuperación de contraseña', async function () {
        const userData = {
            email: 'testuser@example.com', // Email de prueba válido
        };

        // Registra un usuario para luego probar la recuperación de contraseña
        await requester.post('/api/sessions/register').send(userData);

        const res = await requester.get('/api/sessions/mail').send({ email: userData.email });
        expect(res.status).to.equal(200);

        // Verificar el uso de nodemailer para enviar el correo electrónico
        expect(transportStub.calledOnce).to.be.true;
        const callArgs = transportStub.firstCall.args[0];
        expect(callArgs.to).to.equal(userData.email); // Verificar que el correo se envió a la dirección correcta

    });
});

