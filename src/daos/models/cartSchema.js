import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    products: {
        type: [
            {title: {
                type: String,
                required: true,
            },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product" 
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                
            }
        ],
        default: []
    }
});


// Modelo de carrito
const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;