/* import { v4 as uuidv4 } from "uuid"; */
import CartModel from "./models/cartSchema.js";
/* import Product from "./models/productSchema.js"; */



class CartManager {
    constructor() { }

    async createCart() {
        const newCart = new CartModel({
            products: []
        });
        await newCart.save();
        return newCart;
    }
    async saveCart(cart) {
        await cart.save();
    }
    

    async getCartById(cid) {
        const cart = await CartModel.findById(cid);
        return cart;
    }

    async addProductToCart(cid, pid, quantity = 1) {
        let cart = await this.getCartById(cid);

        if (!cart) {
            cart = await this.createCart();
        }

        const existingProductIndex = cart.products.findIndex(product => product.productId.equals(pid));

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ productId: pid, quantity });
        }

        await cart.save();
        return cart;
    }

    async removeProductFromCart(cid, pid) {
        await CartModel.findByIdAndUpdate(cid, {
            $pull: { products: { productId: pid } }
        });
    }

    async updateCartProducts(cid, products) {
        await CartModel.findByIdAndUpdate(cid, { products });
    }
    
    async updateProductQuantity(cid, pid, quantity) {
        await CartModel.findOneAndUpdate(
            { _id: cid, "products.productId": pid },
            { $set: { "products.$.quantity": quantity } }
        );
    }

    async clearCart(cid) {
        await CartModel.findByIdAndUpdate(cid, { products: [] });
    }
}

export default CartManager;
