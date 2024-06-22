import * as chai from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { environment } from "../src/config/config.js";
import ProductRepository from "../src/repositories/productsRepository.js" 
// Importar el modelo Product
import Product from '../src/daos/models/products.schema.js';

const { expect } = chai;
const requester = supertest('http://localhost:3000');
let mockUserAdmin = {
    first_name: 'Admin',
    last_name: 'Admin',
    age: 99,
    email: 'adminTiendita@gmail.com',
    password: '123456789',
    role: 'admin'
}
const productRepository = new ProductRepository();

describe('Test con chai sobre Products API', function() {
    this.timeout(60000); // Configurar timeout para todos los tests

    before(async () => {
        await mongoose.connect(environment.mongoUrlTest);
    });

    beforeEach(async () => {
        if (mongoose.connection.collections.products) {
            await mongoose.connection.collections.products.drop();
        }
    });

    after(async () => {
        await mongoose.disconnect();
    });                                                                        

    it('Mostrar todos los productos y agregar productos de prueba', async function() {
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
        
        const res = await requester.get('/api/products');
        expect(res.status).to.equal(200);
        
    });

    /* it('Crear un nuevo producto sin campos obligatorios', async function() {
        const product2 = {
            description: "Acero inoxidable",
            code: "GT001",
            price: 19.99,
            category: "Herramientas de jardin",
        };
        console.log('Sending product:', product2);
        const res = await requester.post('/api/products').send(product2); 
        console.log('Response status:', res.status);
    expect(res.status).to.equal(400); 
    expect(res.body).to.have.property('errors') 
    });*/

    /* it('Obtener un producto por ID', async function() {
        const product = await Product.create({
            title: "Rastrillo de jardin",
            description: "Rastrillo metalico para jardin",
            code: "GT003",
            price: 15000,
            stock: 30,
            category: "Herramientas de jardin",
            thumbnails: ["http://example.com/rake.jpg"]
        });
        const productRepository = new ProductRepository();

        await product.save();
        const id= product._id
        const res = await productRepository.getProductById(id);
            
        expect(mongoose.isValidObjectId(id)).to.be.true;
        expect(res).to.not.be.empty; 
        
        
        
    }); */

    it('Test para actualizar un producto por ID', async function() {
        const product = await Product.create({
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

        const res = await requester.put(`/api/products/${product._id}`).send(update);

        // Verifica que la respuesta sea exitosa (código 200)
        expect(res.status).to.equal(200);
        
        // Verifica que la respuesta contenga los datos actualizados
        expect(res.body.title).to.equal(update.title);
        expect(res.body.price).to.equal(update.price);
        expect(res.body.stock).to.equal(update.stock);
    });

    it('Test para eliminar un producto por ID', async function() {
        const product = await Product.create({
            title: "Desmalezadora",
            description: "Herramienta para quitar malas hierbas",
            code: "GT005",
            price: 25000,
            stock: 10,
            category: "Herramientas de jardin",
            thumbnails: ["http://example.com/weeder.jpg"]
        });
        await product.save();

        const res = await requester.delete(`/api/products/${product._id}`);

        // Verifica que la respuesta sea exitosa (código 200)
        expect(res.status).to.equal(200);
        
        // Verifica que el mensaje de confirmación sea el esperado
        expect(res.body.message).to.equal("Producto eliminado correctamente");
        
        // Verifica que el producto realmente se haya eliminado
        const deletedProduct = await Product.findById(product._id);
        expect(deletedProduct).to.be.null;
    });
});
