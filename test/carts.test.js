import * as chai from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';
/* import Cart from '../src/daos/models/cartSchema.js'; */
import CartModel from '../src/daos/models/cartSchema.js';
import { environment } from "../src/config/config.js";
import cartRepository from '../src/repositories/cartRepository.js';
import cartsController from '../src/controllers/cartController.js';


const { expect } = chai;
const requester = supertest('http://localhost:3000');

describe('Test con supertest sobre API de Carrito', function () {
    this.timeout(10000);  // Configurar timeout para todos los tests

    before(async () => {
        await mongoose.connect(environment.mongoUrlTest);

    });

    beforeEach(async () => {
        if (mongoose.connection.collections.carts) {
            await mongoose.connection.collections.carts.drop();
        }
    });

    after(async () => {
        await mongoose.disconnect();
    });

    it('Crear un new cart', async () => {
        const res = await requester.post('/api/carts').send();

        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('products').that.is.an('array').and.has.lengthOf(0);
        console.log(res.body);
    });

    it('Mostrar cart by id', async () => {
        // Crear un nuevo carrito
        const res1 = await requester.post('/api/carts').send();

        // Extraer el id del carrito de la respuesta
        const cartId = res1.body.id;

        // Crear un nuevo carrito en la base de datos con el id extraído
        const cart = new CartModel({
            _id: cartId,
            products: [
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e21'), quantity: 2 },
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e22'), quantity: 1 }
            ]
        });
        await cart.save();

        // Hacer una petición GET para obtener el carrito por id
        const res = await requester.get(`/api/carts/${cart._id}`);
        console.log(`mi carrito id: ${cart}`)
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body._id).to.equal(cart._id.toString());
        expect(res.body.products).to.be.an('array')

    });

    it('Agregar productos a cart', async () => {
        // Crear un nuevo carrito "COMPROBADO: crea el carrito"
        const res2 = await requester.post('/api/carts').send();
        const cartId = res2.body.id;

        /* CartId COMPROBADO: trae el cardId */
        console.log("carID:", cartId)

        const productId = new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e23');
        const quantity = 3;
        const res = await requester.post(`/api/carts/${cartId}/products/${productId}`).send({ quantity });
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');

    });

    it('Remover un producto de cart', async () => {
        const cart = new CartModel({
            _id: new mongoose.Types.ObjectId(),
            products: [
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e24'), quantity: 1 },
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e25'), quantity: 2 }
            ]
        });
        await cart.save();

        const productIdToRemove = '60c72b2f9b1d4c1dfc8e7e24';
        const res = await requester.delete(`/api/carts/${cart._id}/products/${productIdToRemove}`);

        expect(res.status).to.equal(204);

    });

    it('Actualizar productos en cart', async () => {
        const cart = new CartModel({
            _id: new mongoose.Types.ObjectId(),
            products: [
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e26'), quantity: 4 },
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e27'), quantity: 2 }
            ]
        });
        await cart.save();

        const updatedProducts = [
            { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e26'), quantity: 3 },
            { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e28'), quantity: 1 }
        ];

        const res = await requester.put(`/api/carts/${cart._id}`).send({ products: updatedProducts });
        expect(res.status).to.equal(204);

    });

    it('Actualizar productos por cantidad en cart', async () => {
        const cart = new CartModel({
            _id: new mongoose.Types.ObjectId(),
            products: [
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e29'), quantity: 4 },
            ]
        });
        await cart.save();

        const productIdToUpdate = '60c72b2f9b1d4c1dfc8e7e29';
        const updatedQuantity = 2;

        const res = await requester.put(`/api/carts/${cart._id}/products/${productIdToUpdate}`).send({ quantity: updatedQuantity });
        expect(res.status).to.equal(204);


    });

    it('Vaciar el cart', async () => {
        const cart = new CartModel({
            _id: new mongoose.Types.ObjectId(),
            products: [
                { product: new mongoose.Types.ObjectId('60c72b2f9b1d4c1dfc8e7e30'), quantity: 4 },
            ]
        });
        await cart.save();

        const res = await requester.delete(`/api/carts/${cart._id}`);
        expect(res.status).to.equal(204);


    });

});
