import * as chai from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';
import Cart from '../src/daos/models/cartSchema.js'; 
import {environment} from "../src/config/config.js"

/* const expect = chai.expect; */
const { expect } = chai;
const requester = supertest('http://localhost:3000');



describe('Test con supertest sobre API de Carrito', () => {
    before(async function (done) {
        this.timeout(10000);
        await mongoose.connect(environment.mongoUrlTest, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, done);
    });

    beforeEach(async function (done) {
        if (mongoose.connection.collections.carts) {
            await mongoose.connection.collections.carts.drop(() => {
                done();
            });
        } else {
            done();
        }
        this.timeout(5000);
    });

    it('Crear un new cart', async function () {
        this.timeout(10000)
        const res = await requester.post('/api/cart').send();
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('userId'); // Assuming userId is generated or assigned
        expect(res.body).to.have.property('items').that.is.an('array').and.has.lengthOf(0);
    });

    it('Mostrar cart by id', async function () {
        this.timeout(10000)
        const cart = new Cart({
            userId: 'user123',
            items: [
                { productId: 'prod1', quantity: 2 },
                { productId: 'prod2', quantity: 1 }
            ]
        });
        await cart.save();

        const res = await requester.get(`/api/cart/${cart._id}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body._id).to.equal(cart._id.toString());
        expect(res.body.userId).to.equal(cart.userId);
        expect(res.body.items).to.be.an('array').with.lengthOf(cart.items.length);
    });

    it('Agregar productos a cart', async function () {
        this.timeout(10000)
        const cart = new Cart({
            userId: 'user456',
            items: []
        });
        await cart.save();

        const productId = 'prod3';
        const quantity = 3;
        const res = await requester.post(`/api/cart/${cart._id}/products/${productId}`).send({ quantity });
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body.items).to.be.an('array').with.lengthOf(1);
        expect(res.body.items[0].productId).to.equal(productId);
        expect(res.body.items[0].quantity).to.equal(quantity);
    });

    it('Remover un rpoducto de cart', async function () {
        this.timeout(10000)
        const cart = new Cart({
            userId: 'user789',
            items: [
                { productId: 'prod5', quantity: 1 },
                { productId: 'prod6', quantity: 2 }
            ]
        });
        await cart.save();

        const productIdToRemove = 'prod5';
        const res = await requester.delete(`/api/cart/${cart._id}/products/${productIdToRemove}`);
        expect(res.status).to.equal(204);

        // Verify the product is removed
        const updatedCart = await Cart.findById(cart._id);
        expect(updatedCart.items).to.be.an('array').with.lengthOf(1);
        expect(updatedCart.items[0].productId).to.not.equal(productIdToRemove);
    });

    it('Actualizar productos en cart', async function () {
        this.timeout(10000)
        const cart = new Cart({
            userId: 'user999',
            items: [
                { productId: 'prod7', quantity: 4 },
                { productId: 'prod8', quantity: 2 }
            ]
        });
        await cart.save();

        const updatedItems = [
            { productId: 'prod7', quantity: 3 },
            { productId: 'prod9', quantity: 1 }
        ];

        const res = await requester.put(`/api/cart/${cart._id}`).send({ products: updatedItems });
        expect(res.status).to.equal(204);

        // Verify the items are updated
        const updatedCart = await Cart.findById(cart._id);
        expect(updatedCart.items).to.be.an('array').with.lengthOf(updatedItems.length);
        expect(updatedCart.items[0].quantity).to.equal(updatedItems[0].quantity);
        expect(updatedCart.items[1].productId).to.equal(updatedItems[1].productId);
    });

    it('Actuaslizar productos por cantidad en cart', async function () {
        this.timeout(10000)
        const cart = new Cart({
            userId: 'user999',
            items: [
                { productId: 'prod10', quantity: 4 },
            ]
        });
        await cart.save();

        const productIdToUpdate = 'prod10';
        const updatedQuantity = 2;

        const res = await requester.put(`/api/cart/${cart._id}/products/${productIdToUpdate}`).send({ quantity: updatedQuantity });
        expect(res.status).to.equal(204);

        // Verify the quantity is updated
        const updatedCart = await Cart.findById(cart._id);
        const updatedItem = updatedCart.items.find(item => item.productId === productIdToUpdate);
        expect(updatedItem.quantity).to.equal(updatedQuantity);
    });

    it('Vaciar el cart', async function () {
        this.timeout(10000)
        const cart = new Cart({
            userId: 'user999',
            items: [
                { productId: 'prod11', quantity: 4 },
            ]
        });
        await cart.save();

        const res = await requester.delete(`/api/cart/${cart._id}`);
        expect(res.status).to.equal(204);

        // Verify the cart is cleared
        const updatedCart = await Cart.findById(cart._id);
        expect(updatedCart.items).to.be.an('array').with.lengthOf(0);
    });

    it('Completar el proceso de compra', async function () {
        this.timeout(10000)
        const cart = new Cart({
            userId: 'user999',
            items: [
                { productId: 'prod12', quantity: 2 },
                { productId: 'prod13', quantity: 3 }
            ]
        });
        await cart.save();

        const res = await requester.post(`/api/cart/${cart._id}/purchase`);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('message').that.equals('Compra completada con éxito');
        expect(res.body).to.have.property('ticket').that.is.an('object');
        expect(res.body).to.have.property('productsNotPurchasedIds').that.is.an('array').with.lengthOf(0);
    });
});

