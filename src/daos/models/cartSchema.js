import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    _id: String,
    /* _id: mongoose.Schema.Types.ObjectId, */
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products"
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        default: []
    }
});


// Modelo de carrito
const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;