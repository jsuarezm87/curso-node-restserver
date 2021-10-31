const { request, response } = require('express');
const { Categoria } = require('../models');

const populate = {path: 'usuario', select: 'nombre'}


const obtenerCategorias = async ( req = request, res = response ) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };    
    
    // Promise.all ejecuta las promesas simultaneas
    const [ total, categorias ] = await Promise.all([
        Categoria.countDocuments( query ),
        Categoria.find( query )
            .populate( populate )
            .skip( Number( desde ) )
            .limit( Number( limite ) )
    ]);

    res.json({
        total,
        categorias
    });
}

// obtenerCategoria - populate {}
const obtenerCategoria = async ( req = request, res = response ) => {

    const { id } = req.params;
    const categoria = await Categoria.findById( id ).populate( 'usuario', 'nombre' );

    res.json({ categoria });    
}


const crearCategoria = async( req = request, res = response ) => {

    const nombre = req.body.nombre.toUpperCase();

    const categoriaDB = await Categoria.findOne({ nombre });

    if ( categoriaDB ){
        return res.status(400).json({
           msg: `La categoria ${ categoriaDB.nombre }, ya existe` 
        });
    }

    // Generar la data a guardar
    const data = { 
        nombre,
        usuario: req.usuario._id
    }

    const categoria = new Categoria( data );

    // Guardar en BD
    await categoria.save();

    res.status(201).json( categoria );
}

// actualizarCategoria
const actualizarCategoria = async ( req = request, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;
    //const { _id, estado, usuario, ...resto } = req.body;

    data.nombre = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    // {new: true} => Para que se mire en la respuesta la informacion nueva.
    const categoria = await Categoria.findByIdAndUpdate(id, data, {new: true}).populate(populate);

    res.json( categoria ); 
}

// borrarCategoria - estado:false
const borrarCategoriad = async ( req = request, res = response ) => {

    const { id } = req.params;
    const categoria = await Categoria.findByIdAndUpdate( id, { estado: false }, {new: true} );

    res.json( categoria );
}


module.exports = {
    crearCategoria,
    obtenerCategorias,
    obtenerCategoria,
    actualizarCategoria,
    borrarCategoriad
}
