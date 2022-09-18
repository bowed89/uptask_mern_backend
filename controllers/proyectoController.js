import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) => {

    // seleccionar proyectos, que muestren a colaboradores o creadores...
    const proyectos = await Proyecto.find({
        $or: [
            { colaboradores: { $in: req.usuario } },
            { creador: { $in: req.usuario } }
        ]
    }).select("-tareas")

    res.json(proyectos)

}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }

}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)
        .populate({path: 'tareas', populate: {path: 'completado', select: 'nombre'}})
        .populate("colaboradores", "nombre email")
    
        console.log(proyecto);

    if (!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(401).json({ msg: error.message });
    }
    // proyecto.creador es el ID del usuario que creo el proyecto
    // req.usuario._id es el ID del usuario que se esta logueando con su token...
    if (proyecto.creador.toString() !== req.usuario._id.toString() &&
        !proyecto.colaboradores.some((colaborador) =>
            colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("El usuario no creo el proyecto, no tiene autorización")
        return res.status(401).json({ msg: error.message });
    }

    // Obtener las tareas del proyecto
    //const tareas = await Tarea.find().where("proyecto").equals(proyecto._id)

    res.json(proyecto)
}

const editarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(401).json({ msg: error.message });
    }
    // proyecto.creador es el ID del usuario que creo el proyecto
    // req.usuario._id es el ID del usuario que se esta logueando con su token...
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("El usuario no creo el proyecto, no tiene autorización")
        return res.status(401).json({ msg: error.message });
    }
    // Obtiene los datos del body, pero sino actualiza todos los campos se agarra el dato por defecto de la BD
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)

    } catch (error) {
        console.log(error);
    }

}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(401).json({ msg: error.message });
    }
    // proyecto.creador es el ID del usuario que creo el proyecto
    // req.usuario._id es el ID del usuario que se esta logueando con su token...
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("El usuario no creo el proyecto, no tiene autorización")
        return res.status(401).json({ msg: error.message });
    }

    try {
        await proyecto.deleteOne();
        res.json({ msg: "Proyecto Eliminado" });
    } catch (error) {
        console.log(error);
    }

}

const buscarColaborador = async (req, res) => {
    const { email } = req.body
    const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if (!usuario) {
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message })
    }
    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if (!proyecto) {
        const error = new Error("Proyecto no Encontrado")
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Válida")
        return res.status(404).json({ msg: error.message })
    }

    const { email } = req.body
    const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if (!usuario) {
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    // El colaborador no puede ser el admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error("El Creador del Proyecto no puede ser Colaborador")
        return res.status(404).json({ msg: error.message })
    }

    // Revisar que no este agregado el usuario al proyecto 
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error("El Usuario ya Pertenece al Proyecto")
        return res.status(404).json({ msg: error.message })
    }

    // Si pasa todos esos advertencias se incluye ....
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()

    res.json({ msg: "colaborador Agregado Correctamente" })

}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if (!proyecto) {
        const error = new Error("Proyecto no Encontrado")
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no Válida")
        return res.status(404).json({ msg: error.message })
    }

    // Si esta bien, se puede eliminar...
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({ msg: "colaborador Eliminado Correctamente" })

}



export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}