const { request, response, json } = require('express');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/google-verify');



const login = async( req = request, res = response ) => {

    const { correo, password } = req.body;

    try {

        // Verificar si el correo existe en
        const usuario = await Usuario.findOne({ correo });
        if ( !usuario ) {
            return res.status(400).json({
                msg:"Usuario / Password no son correctos - correo"
            });
        }        

        // verificar si el usuario esta activo
        if ( !usuario.estado ) {
            return res.status(400).json({
                msg:"Usuario / Password no son correctos - estado: false"
            });
        }      

        // verificar la contraseña actual
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg:"Usuario / Password no son correctos - password"
            });
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );
        
        
        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });       
    }
}

const googleSignIn = async( req = request, res = response ) => {
    
    const { id_token } = req.body;

    try {       
        const { nombre, img, correo } = await googleVerify( id_token );
        let usuario = await Usuario.findOne({ correo });

        if ( !usuario ) {
            // Tengo que crearlos
            const data = { 
                nombre,
                correo,
                password: ':P',
                img,
                google: true
            };

            usuario = new Usuario( data );
            await usuario.save();
     
        } 

        // Si el usuario en BD
        if ( !usuario.estado ) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });            
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token
        })
        
    } catch (error) {
        json.status(400).json({
            msg: 'El token no se pudo verificar'
        })                
    }

    
}

module.exports = {
    login,
    googleSignIn
}