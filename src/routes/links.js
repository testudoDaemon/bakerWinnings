const express = require('express');
const router = express.Router();
const pool = require('../database');
const { use } = require('passport');
const { body, validationResult } = require('express-validator');
const { data } = require('autoprefixer');
const helpers = require('../lib/helpers');
const util = require('util'); // Asegúrate de tener esta línea
const { error } = require('console');

const poolQuery = util.promisify(pool.query).bind(pool);

router.get('/home', (req, res) => {
    res.render('links/home', {
        layout: 'main_menu',
        title: 'Home',
        stylesheets: ['/css/shome.css']
    }
    );
});

router.get('/gestion', (req, res) => {
    res.render('links/gestionar_usuarios', {
        title: 'Gestionar Usuarios',
        ingresarUsuarioUrl: '/links/add',
        modificarUsuarioUrl: '/links/modificar_usuarios',
        eliminarUsuarioUrl: '/links/eliminar',
        stylesheets: ['/css/custom.css']
    }
    );
});

router.get('/add', (req, res) => {
    res.render('links/insertar_usuarios', {
        title: 'Insertar Usuarios',
        stylesheets: ['/css/custom.css'],
        errors: [],
        data: {}
    }
    );
});


router.post('/add', [
    body('nombre').notEmpty().withMessage('Falta nombre'),
    body('apellido_paterno').notEmpty().withMessage('Falta apellido paterno'),
    body('apellido_materno').notEmpty().withMessage('Falta apellido materno'),
    body('correo').isEmail().withMessage('Falta correo'),
    body('telefono').notEmpty().withMessage('Falta teléfono'),
    body('contrasena').notEmpty().withMessage('Falta contraseña')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/insertar_usuarios', {
            title: 'Ingresar Usuario',
            errors: errors.array(),
            data: req.body // Repoblar el formulario con los datos ingresados
        });
    }

    // Si no hay errores, procede con la lógica de inserción de usuario
    const { nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena } = req.body;

    try {

        const existingUser = await poolQuery('SELECT * FROM Usuarios WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ?',
            [nombre, apellido_paterno, apellido_materno]
        );

        const existingCorreo = await poolQuery('SELECT * FROM Correos WHERE correo = ?',
            [correo]
        );
        const existingTelefono = await poolQuery('SELECT * FROM Telefonos WHERE telefono = ?',
            [telefono]
        );

        if (existingUser.length > 0 || existingCorreo.length > 0 || existingTelefono.length > 0) {
            return res.render('links/insertar_usuarios', {
                title: 'Insertar Usuarios',
                errors: [{ msg: 'Ya existe un registro con los mismos datos' }],
                data: req.body
            });
        }

        const encryptedPassword = await helpers.encryptPassword(contrasena);

        const correoResult = await queryAsync('INSERT INTO Correos (correo) VALUES (?)', [correo]);
        const idCorreo = correoResult.insertId;

        const telefonoResult = await queryAsync('INSERT INTO Telefonos (telefono) VALUES (?)', [telefono]);
        const idTelefono = telefonoResult.insertId;

        const user = {
            nombre,
            apellido_paterno,
            apellido_materno,
            id_correo: idCorreo,
            id_telefono: idTelefono
        };
        const userResult = await queryAsync('INSERT INTO Usuarios SET ?', [user]);
        const numEmpleado = userResult.insertId;

        const userpass = {
            num_empleado: numEmpleado,
            password: encryptedPassword
        };
        await queryAsync('INSERT INTO Usuarios_contrasena SET ?', [userpass]);

        res.render('links/insertar_usuarios', {
            title: 'Insertar Usuarios',
            success_msg: 'Usuario insertado correctamente',
            error_msg: null
        });
    } catch (err) {
        console.error(err);
        res.render('links/insertar_usuarios', {
            title: 'Agregar Usuario',
            success_msg: null,
            error_msg: 'Error al insertar el usuario'
        });
    }
});


router.get('/buscar-usuario', async (req, res) => {
    const { idusuario } = req.query;

    try {
        const usuario = await pool.query('SELECT * FROM Usuarios WHERE num_empleado = ?', [idusuario]);
        if (usuario.length > 0) {
            const correo = await pool.query('SELECT correo FROM Correos WHERE id_correo = ?', [usuario[0].id_correo]);
            const telefono = await pool.query('SELECT telefono FROM Telefonos WHERE id_telefono = ?', [usuario[0].id_telefono]);

            res.render('links/modificar_usuarios', {
                title: 'Modificar Usuarios',
                data: {
                    num_empleado: usuario[0].num_empleado,
                    nombre: usuario[0].nombre,
                    apellido_paterno: usuario[0].apellido_paterno,
                    apellido_materno: usuario[0].apellido_materno,
                    correo: correo[0].correo,
                    telefono: telefono[0].telefono
                },
                errors: [],
                success_msg: null,
                error_msg: null
            });
        } else {
            res.render('links/modificar_usuarios', {
                title: 'Modificar Usuarios',
                data: {},
                errors: [],
                success_msg: null,
                error_msg: 'Usuario no encontrado'
            });
        }
    } catch (err) {
        console.error('Error al buscar el usuario:', err);
        res.render('links/modificar_usuarios', {
            title: 'Modificar Usuarios',
            data: {},
            errors: [],
            success_msg: null,
            error_msg: 'Error al buscar el usuario'
        });
    }
});


router.get('/modificar_usuarios', (req, res) => {
    res.render('links/modificar_usuarios', {
        title: 'Modificar Usuarios',
        errors: [],
        data: {}
    }
    );
});

router.post('/actualizar-usuario', [
    body('nombre').notEmpty().withMessage('Falta nombre'),
    body('apellido_paterno').notEmpty().withMessage('Falta apellido paterno'),
    body('apellido_materno').notEmpty().withMessage('Falta apellido materno'),
    body('correo').isEmail().withMessage('Falta correo'),
    body('telefono').notEmpty().withMessage('Falta teléfono')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/modificar_usuarios', {
            title: 'Modificar Usuario',
            errors: errors.array(),
            data: req.body
        });
    }

    const { num_empleado, nombre, apellido_paterno, apellido_materno, correo, telefono } = req.body;
    console.log('HOLAAAA ID Usuario:', num_empleado);  // Verifica que num_empleado tiene un valor

    try {
        // Verificar si ya existe un registro con los mismos datos
        const existingUser = await pool.query(
            'SELECT * FROM Usuarios WHERE LOWER(nombre) = ? AND LOWER(apellido_paterno) = ? AND LOWER(apellido_materno) = ? AND LOWER(num_empleado) != ?',
            [nombre, apellido_paterno, apellido_materno, num_empleado]
        );

        const existingCorreo = await pool.query(
            'SELECT * FROM Correos WHERE LOWER(correo) = ? AND id_correo != (SELECT id_correo FROM Usuarios WHERE num_empleado = ?)',
            [correo, num_empleado]
        );

        const existingTelefono = await pool.query(
            'SELECT * FROM Telefonos WHERE LOWER(telefono) = ? AND LOWER(id_telefono) != (SELECT id_telefono FROM Usuarios WHERE num_empleado = ?)',
            [telefono, num_empleado]
        );

        if (existingUser.length > 0 || existingCorreo.length > 0 || existingTelefono.length > 0) {
            return res.render('links/modificar_usuarios', {
                title: 'Modificar Usuario',
                errors: [{ msg: 'Ya existe un registro con los mismos datos' }],
                data: req.body
            });
        }

        // Actualiza la información del usuario
        
        const resultUsuario = await pool.query(
            'UPDATE Usuarios SET nombre = ?, apellido_paterno = ?, apellido_materno = ? WHERE num_empleado = ?',
            [nombre, apellido_paterno, apellido_materno, num_empleado]
        );
        console.log('Usuario actualizado:', resultUsuario);

        // Actualiza el correo del usuario
        const resultCorreo = await pool.query(
            'UPDATE Correos SET correo = ? WHERE id_correo = (SELECT id_correo FROM Usuarios WHERE num_empleado = ?)',
            [correo, num_empleado]
        );
        console.log('Correo actualizado:', resultCorreo);

        // Actualiza el teléfono del usuario
        const resultTelefono = await pool.query(
            'UPDATE Telefonos SET telefono = ? WHERE id_telefono = (SELECT id_telefono FROM Usuarios WHERE num_empleado = ?)',
            [telefono, num_empleado]
        );
        console.log('Teléfono actualizado:', resultTelefono);

        res.render('links/modificar_usuarios', {
            title: 'Modificar Usuarios',
            success_msg: 'Datos del empleado actualizados',
            error_msg: null
        });
    } catch (err) {
        console.error('Error al actualizar el usuario:', err);
        res.render('links/modificar_usuarios', {
            title: 'Modificar Usuarios',
            success_msg: null,
            error_msg: 'Error al actualizar el usuario'
        });
    }
});

function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}


router.get('/buscar-usuario-eliminar', async (req, res) => {
    const { idusuario } = req.query;

    try {
        const usuario = await pool.query('SELECT * FROM Usuarios WHERE num_empleado = ?', [idusuario]);
        if (usuario.length > 0) {
            const correo = await pool.query('SELECT correo FROM Correos WHERE id_correo = ?', [usuario[0].id_correo]);
            const telefono = await pool.query('SELECT telefono FROM Telefonos WHERE id_telefono = ?', [usuario[0].id_telefono]);
            console.log('Usuario:', idusuario);
            res.render('links/eliminar_usuarios', {
                title: 'Eliminar Usuarios',
                data: {
                    num_empleado: usuario[0].num_empleado,
                    nombre: usuario[0].nombre,
                    apellido_paterno: usuario[0].apellido_paterno,
                    apellido_materno: usuario[0].apellido_materno,
                    correo: correo[0].correo,
                    telefono: telefono[0].telefono
                },
                success_msg: null,
                error_msg: null
            });
        } else {
            res.render('links/eliminar_usuarios', {
                title: 'Eliminar Usuarios',
                data: {},
                success_msg: null,
                error_msg: 'Usuario no encontrado'
            });
        }
    } catch (err) {
        console.error('Error al buscar el usuario:', err);
        res.render('links/eliminar_usuarios', {
            title: 'Eliminar Usuarios',
            data: {},
            success_msg: null,
            error_msg: 'Error al buscar el usuario'
        });
    }
});

router.get('/eliminar', (req, res) => {
    res.render('links/eliminar_usuarios', {
        title: 'Eliminar Usuarios',
        errors: [],
        data: {}
    });
});

// Ruta para manejar la eliminación de usuarios
router.post('/eliminar-usuario', [
    body('nombre').notEmpty().withMessage('Falta nombre'),
    body('apellido_paterno').notEmpty().withMessage('Falta apellido paterno'),
    body('apellido_materno').notEmpty().withMessage('Falta apellido materno'),
    body('correo').isEmail().withMessage('Falta correo'),
    body('telefono').notEmpty().withMessage('Falta teléfono')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { idusuario } = req.body;

    try {
        console.log('ID Usuario:', idusuario);
        await poolQuery('DELETE FROM Usuarios_contrasena WHERE num_empleado = ?', [idusuario]);
        await poolQuery('DELETE FROM Usuarios WHERE num_empleado = ?', [idusuario]);
        await poolQuery('DELETE FROM Correos WHERE id_correo = ?', [idusuario]);
        await poolQuery('DELETE FROM Telefonos WHERE id_telefono = ?', [idusuario]);

        res.render('links/eliminar_usuarios', {
            title: 'Eliminar Usuarios',
            success_msg: 'Usuario eliminado correctamente',
            error_msg: null,
            data: {}
        });
    } catch (err) {
        console.error('Error al eliminar el usuario:', err);
        res.render('links/eliminar_usuarios', {
            title: 'Eliminar Usuarios',
            success_msg: null,
            error_msg: 'Error al eliminar el usuario',
            data: {}
        });
    }
});

router.get('/ingredientes', (req, res) => {
    res.render('links/ingredientes', {
        layout: 'main_menu',
        stylesheets: ['/css/shome.css'],
        title: 'Ingredientes',
        errors: [],
        data: {}
    }); 
});

// Nueva ruta para obtener los datos de los ingredientes
router.get('/api/ingredientes', async (req, res) => {
    try {
        const ingredientes = await pool.query('SELECT * FROM Ingredientes');
        res.json(ingredientes);
    } catch (error) {
        console.error('Error al obtener los ingredientes: ', error);
        res.status(500).json({ error: 'Error al obtener los ingredientes' });
    }
});

// Ruta para agregar un ingredientes
router.post('/ingredientes', [
    body('nombre_ingrediente').notEmpty().withMessage('Falta nombre del ingrediente'),
    body('costo_ingrediente').notEmpty().withMessage('Falta costo del ingrediente'),
    body('cantidad_ingrediente').notEmpty().withMessage('Falta cantidad del ingrediente'),
    body('tipo_cantidad').notEmpty().withMessage('Falta tipo de cantidad')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Ingredientes',
            errors: errors.array(),
            data: req.body 
        });
    }

    // Si no hay errores, procede con la lógica de inserción de ingredientes
    const { nombre_ingrediente, costo_ingrediente, cantidad_ingrediente, tipo_cantidad } = req.body;

    try {

        const existeNomIngrediente = await poolQuery('SELECT LOWER(nombre_ingrediente) FROM Ingredientes WHERE LOWER(nombre_ingrediente) = ?', [nombre_ingrediente]);
        const existingProducto = await poolQuery('SELECT * FROM Ingredientes WHERE costo_ingrediente = ? AND cantidad_ingrediente = ? AND tipo_cantidad = ?',
            [costo_ingrediente, cantidad_ingrediente, tipo_cantidad]
        );

        console.log('Nombre del ingrediente:', existeNomIngrediente);
        console.log('La otra parte de ingredientes:', existingProducto);

        if (existeNomIngrediente.length > 0) {
            return res.render('links/ingredientes', {
                layout: 'main_menu',
                stylesheets: ['/css/shome.css'],
                title: 'Productos',
                errors: [{ msg: 'Se repiten los datos' }],
                data: req.body
            });
        }  else if (existingProducto.length > 0) {
            return res.render('links/ingredientes', {
                layout: 'main_menu',
                stylesheets: ['/css/shome.css'],
                title: 'Ingredientes',
                errors: [{ msg: 'Se repiten los datos' }],
                data: req.body
            });
        } else {
            const prod = {
                nombre_ingrediente,
                costo_ingrediente,
                cantidad_ingrediente,
                tipo_cantidad
            };
            const productoResult = await queryAsync('INSERT INTO Ingredientes SET ?', [prod]);
            const idIng = productoResult.insertId;
    
            res.render('links/ingredientes', {
                layout: 'main_menu',
                stylesheets: ['/css/shome.css'],
                title: 'Insertar Usuarios',
                success_msg: 'Ingrediente insertado correctamente',
                error_msg: null
            });
        }
    } catch (err) {
        console.error(err);
        res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Agregar Ingrediente',
            success_msg: null,
            error_msg: 'Error al insertar ingredientes'
        });
    }
});

// Ruta para actualizar un producto
router.post('/actualizar-ingrediente', [
    body('nombre_ingrediente_actualizar').notEmpty().withMessage('Falta nombre del ingrediente'),
    body('costo_ingrediente_actualizar').notEmpty().withMessage('Falta costo del ingrediente'),
    body('cantidad_ingrediente_actualizar').notEmpty().withMessage('Falta cantidad del ingrediente'),
    body('tipo_cantidad_actualizar').notEmpty().withMessage('Falta tipo de cantidad')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Ingredientes',
            errors: errors.array(),
            data: req.body 
        });
    }

    
    // Si no hay errores, procede con la lógica de actualización de producto
    const { idIngrediente, nombre_ingrediente_actualizar, costo_ingrediente_actualizar, cantidad_ingrediente_actualizar, tipo_cantidad_actualizar } = req.body;

    console.log(req.body);
    try {
          // Verificar si los datos se repiten
          const datosRepetidos = await poolQuery('SELECT * FROM Ingredientes WHERE LOWER(nombre_ingrediente) = ? AND costo_ingrediente = ? AND cantidad_ingrediente = ? AND tipo_cantidad = ? AND idIngrediente != ?',
            [nombre_ingrediente_actualizar.toLowerCase(), costo_ingrediente_actualizar, cantidad_ingrediente_actualizar, tipo_cantidad_actualizar, idIngrediente]
        );

        
        if (datosRepetidos.length > 0) {
            return res.render('links/ingredientes', {
                layout: 'main_menu',
                stylesheets: ['/css/shome.css'],
                title: 'Ingredientes',
                errors: [{ msg: 'Se repiten los datos' }],
                data: req.body
            });
        }

        // Actualizar el producto
        await poolQuery('UPDATE Ingredientes SET nombre_ingrediente = ?, costo_ingrediente = ?, cantidad_ingrediente = ?, tipo_cantidad = ? WHERE idIngrediente = ?',
            [nombre_ingrediente_actualizar, costo_ingrediente_actualizar, cantidad_ingrediente_actualizar, tipo_cantidad_actualizar, idIngrediente]
        );

        res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Ingredientes',
            success_msg: 'Ingrediente actualizado correctamente',
            error_msg: null
        });
    } catch (err) {
        console.error(err);
        res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Ingredientes',
            success_msg: null,
            error_msg: 'Error al actualizar ingrediente'
        });
    }
});

// Ruta para eliminar un producto por nombre
router.post('/eliminar-ingrediente', [
    body('nombre_ingrediente_eliminar').notEmpty().withMessage('Falta nombre del ingrediente')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Ingredientes',
            errors: errors.array(),
            data: req.body 
        });
    }

    const { nombre_ingrediente_eliminar } = req.body;

    try {
        const existingProducto = await poolQuery('SELECT * FROM Ingredientes WHERE nombre_ingrediente = ?', [nombre_ingrediente_eliminar]);

        if (existingProducto.length === 0) {
            return res.render('links/ingredientes', {
                layout: 'main_menu',
                stylesheets: ['/css/shome.css'],
                title: 'Ingredientes',
                errors: [{ msg: 'El producto no existe' }],
                data: req.body
            });
        }

        await poolQuery('DELETE FROM Ingredientes WHERE nombre_ingrediente = ?', [nombre_ingrediente_eliminar]);

        res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Productos',
            success_msg: 'Producto eliminado correctamente',
            error_msg: null
        });
    } catch (err) {
        console.error(err);
        res.render('links/ingredientes', {
            layout: 'main_menu',
            stylesheets: ['/css/shome.css'],
            title: 'Productos',
            success_msg: null,
            error_msg: 'Error al eliminar producto'
        });
    }
});

router.get('/produccion', (req, res) => {
    res.render('links/produccion', {
        layout: 'main_menu',
        stylesheets: ['/css/shome.css'],
        title: 'Produccion',
        errors: [],
        data: {}
    });
});

router.get('/ventas', (req, res) => {
    res.render('links/ventas', {
        layout: 'main_menu',
        stylesheets: ['/css/shome.css'],
        title: 'Ventas',
        errors: [],
        data: {}
    });
});

router.post('/ventas', [], async (req, res) => {
    }
);

// las cosas van antes de aqui
module.exports = router;