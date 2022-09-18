import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)

//Antes que ejecute el SAVE en la BD, correra esta funcion para hashear el password
usuarioSchema.pre('save', async function (next) {
    // Al momento de querer modificar el password entra en esta condición
    if(!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10)
    // this.password viene del req.body.password del json q envia el cliente... 
    this.password = await bcrypt.hash(this.password, salt)
})

// Comprobar password de usa en usuariocontroller en autenticar ...
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema)
export default Usuario;