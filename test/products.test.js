import * as chai from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';
import {environment} from "../src/config/config.js"


/* Trabajo sobre el router de productos */

/* const expect = chai.expect; */
const { expect } = chai;
const requester = supertest('http://localhost:3000')



// Importar el modelo Product
import Product from '../src/daos/models/products.schema.js';
describe('Test con chai sobre Products API', () => {
    before(async function (done) {
        this.timeout(10000);
        await mongoose.connect(environment.mongoUrlTest, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, done);
    });

    beforeEach(async function (done) {
        // Limpiar la colección de productos antes de cada test
        if (mongoose.connection.collections.products) {
            await mongoose.connection.collections.products.drop(() => {
                done();
            });
        } else {
            done();
        }
        this.timeout(5000);
    });

    
    it('Mostrar todos los productos y agregar productos de prueba', async function () {
        this.timeout(10000)
        // Poblar la base de datos con datos de prueba
        await Product.create({
            title: "Regadera de Jardin",
            description: "Regadera para suculentas de 1.2 lts",
            code: "GT002",
            price: 19000,
            stock: 50,
            category: "Herramientas de jardin",
            thumbnails: ["http://example.com/shovel.jpg"]
        });

        const res = await requester.get('/api/products').send(Product);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(1);
    });

    it('Crear un nuevo producto sin campos obligatorios', async function () {
        this.timeout(10000)
        const product = {
            description: "Tijera de podar",
            code: "GT001",
            price: 19.99,
            stock: 50,
            category: "Herramientas de jardin"
        };
        const res = await requester.post('/api/products').send(product);
        expect(res.status).to.equal(400);
        expect(res.body).to.be.an('object');
        expect(res.body.length).to.have.property('errors');
    });

    
    it('Crear un nuevo producto con todos los campos requeridos', async function () {
        this.timeout(10000)
        const product = {
            title: "Pala corazon",
            description: "De hierro fundido hecha por Efestos",
            code: "GT009",
            price: 35000,
            stock: 4,
            category: "Herramientas de jardin",
            thumbnails: ["http://example.com/shovel.jpg"]
        };
        const res = await requester.post('/api/products').send(product);
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('title').eql(product.title);
        expect(res.body).to.have.property('description').eql(product.description);
        expect(res.body).to.have.property('code').eql(product.code);
        expect(res.body).to.have.property('price').eql(product.price);
        expect(res.body).to.have.property('stock').eql(product.stock);
        expect(res.body).to.have.property('category').eql(product.category);
        expect(res.body).to.have.property('thumbnails').eql(product.thumbnails);
    });


    it('Obtener un producto por ID', async function () {
        this.timeout(10000)
        const product = new Product({
            title: "Rastrillo de jardin",
            description: "Rastrillo metalico para jardin",
            code: "GT003",
            price: 15000,
            stock: 30,
            category: "Herramientas de jardin",
            thumbnails: ["http://example.com/rake.jpg"]
        });
        await product.save();
        const res = await requester.get('/api/products/' + product.id);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('title').eql(product.title);
        expect(res.body).to.have.property('description').eql(product.description);
        expect(res.body).to.have.property('code').eql(product.code);
        expect(res.body).to.have.property('price').eql(product.price);
        expect(res.body).to.have.property('stock').eql(product.stock);
        expect(res.body).to.have.property('category').eql(product.category);
        expect(res.body).to.have.property('thumbnails').eql(product.thumbnails);
        expect(res.body).to.have.property('_id').eql(product.id);
    });

    it('Test para actualizar un producto por ID', async function () {
        this.timeout(10000)
        const product = new Product({
            title: "Tijeras de podar",
            description: "Tijeras para cortar ramas pequeñas",
            code: "GT004",
            price: 12000,
            stock: 20,
            category: "Herramientas de jardin",
            thumbnails: ["http://example.com/scissors.jpg"]
        });
        await product.save();

        const update = {
            title: "Tijeras de podar actualizadas",
            price: 15000,
            stock: 15
        };

        const res = await requester.put('/api/products/' + product.id).send(update);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('title').eql(update.title);
        expect(res.body).to.have.property('price').eql(update.price);
        expect(res.body).to.have.property('stock').eql(update.stock);
    });

    it('Test para eliminar un producto por ID', async function () {
        this.timeout(10000)
        const product = new Product({
            title: "Desmalezadora",
            description: "Herramienta para quitar malas hierbas",
            code: "GT005",
            price: 25000,
            stock: 10,
            category: "Herramientas de jardin",
            thumbnails: ["http://example.com/weeder.jpg"]
        });
        await product.save();

        const res = await requester.delete('/api/products/' + product.id);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('message').eql("Producto eliminado correctamente");
        expect(res.body).to.have.property('deletedProduct').to.be.an('object');
        expect(res.body.deletedProduct).to.have.property('_id').eql(product.id);
    });
});
