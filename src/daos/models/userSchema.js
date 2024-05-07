import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required: true
    },
    last_name:{
        type:String,
        required: true
    },
    age:{
        type:Number,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    role: {
        type:String,
        required:true,
        default: "user"
    },
    premium: {
        type: Boolean,
        default: false // Por defecto, el usuario no es premium
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart" // Referencia al modelo de carrito
    }

});

export default mongoose.model("Users", UsersSchema)