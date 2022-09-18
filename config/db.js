import mongoose from 'mongoose'

const conectarDB = async () => {
    try {
        // 'uptask' => le ponemos ese nombre a la BD.
        const connection = await mongoose.connect(
            process.env.MONGO_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )

        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(`MongoDB Conectado en: ${url}`);

    } catch (error) {
        console.log(`Error: ${error}`);
        process.exit(1)
    }
}

export default conectarDB;