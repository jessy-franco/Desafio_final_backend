import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"


const productSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    thumbnails: {
        type: [String],
         // Cambiado a un array de String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users' // Referencia al modelo de usuario
    }
});
productSchema.plugin(mongoosePaginate);
const Product = mongoose.model( "Product", /* productCollections, */ productSchema);

export default Product;
