const { request, response } = require('express');
const { Producto, Categoria } = require('../models');

const populateUsuario = {path: 'usuario', select: 'nombre'}
const populateCategoria = {path: 'categoria', select: 'nombre'}

const obtenerProductos = async (req = request, res = response) => {
    
    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };  

     // Promise.all ejecuta las promesas simultaneas
     const [ total, productos ] = await Promise.all([
        Producto.countDocuments( query ),
        Producto.find( query )
            .populate( populateUsuario )
            .populate( populateCategoria )
            .skip( Number( desde ) )
            .limit( Number( limite ) )
    ]);

    res.json({
        total,
        productos
    });
}

const obtenerProducto = async ( req = request, res = response) => {

    const { id } = req.params;
    const producto = await Producto.findById( id )
                                   .populate( populateUsuario )
                                   .populate( populateCategoria );

    res.json({ producto });
}

const crearProducto = async (req = request, res = response) => {

    const nombre = req.body.nombre.toUpperCase();
    const categoria = req.body.categoria.toUpperCase();
    const { precio, descripcion} = req.body;

    const [ categoriaDB, productoBD ] = await Promise.all([
        Categoria.findOne({ nombre: categoria }),
        Producto.findOne({ nombre })
    ]);

    if ( productoBD ) {
        return res.status(400).json({
            msg: `El producto ${ nombre }, ya existe`
        });        
    }

    if ( !categoriaDB ){
        return res.status(400).json({
           msg: `La categoria ${ categoria }, no existe` 
        });
    }

    //Generar data a guardar
    const data = {
        nombre,
        usuario: req.usuario._id,
        precio,
        categoria: categoriaDB._id,
        descripcion
    }

    producto = new Producto( data );

    // Guardar en BD
    await producto.save();

    res.status(201).json( producto );
}

const actualizarProducto = async ( req = request, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    if ( data.nombre ){
        data.nombre  = data.nombre.toUpperCase();
    }
    
    data.usuario = req.usuario._id;

    const producto = await Producto.findByIdAndUpdate( id, data, {new: true});

    res.json( producto );    
    
}

const borrarProducto = async ( req = request, res = response ) => {

    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate( id, { estado: false }, {new: true} );

    res.json( producto );
}


module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    borrarProducto
}