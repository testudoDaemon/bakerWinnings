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

router.get('/productos', (req, res) => {
    res.render('links/productos', {
        title: 'Productos',
        errors: [],
        data: {}
    }); 
});

// Nueva ruta para obtener los datos de los ingredientes
router.get('/api/productos', async (req, res) => {
    try {
        const ingredientes = await pool.query('SELECT * FROM ingredientes');
        res.json(ingredientes);
    } catch (error) {
        console.error('Error al obtener los ingredientes: ', error);
        res.status(500).json({ error: 'Error al obtener los ingredientes' });
    }
});

// Ruta para agregar un producto
router.post('/productos', [
    body('Nombre_producto').notEmpty().withMessage('Falta nombre del producto'),
    body('Costo_producto').notEmpty().withMessage('Falta el costo del producto'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/productos', {
            title: 'Productos',
            errors: errors.array(),
            data: req.body 
        });
    }

    // Si no hay errores, procede con la lógica de inserción de usuario
    const { nombre_producto, costo_producto } = req.body;

    try {

        const existingProducto = await poolQuery('SELECT * FROM ingredientes WHERE nombre_ingrediente = ? AND costo_ingrediente = ?',
            [nombre_producto, costo_producto]
        );

        if (existingProducto.length > 0) {
            return res.render('links/productos', {
                title: 'Productos',
                errors: [{ msg: 'Se repiten los datos' }],
                data: req.body
            });
        }

        const prod = {
            nombre_producto,
            costo_producto
        };
        const productoResult = await queryAsync('INSERT INTO ingredientes SET ?', [prod]);
        const idIng = productoResult.insertId;

        res.render('links/productos', {
            title: 'Insertar Usuarios',
            success_msg: 'Usuario insertado correctamente',
            error_msg: null
        });
    } catch (err) {
        console.error(err);
        res.render('links/productos', {
            title: 'Agregar productos',
            success_msg: null,
            error_msg: 'Error al insertar producto'
        });
    }
});

// Ruta para actualizar un producto
router.post('/actualizar-producto', [
    body('nombre_producto').notEmpty().withMessage('Falta nombre del producto'),
    body('costo_producto').notEmpty().withMessage('Falta el costo del producto'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/productos', {
            title: 'Productos',
            errors: errors.array(),
            data: req.body 
        });
    }

    // Si no hay errores, procede con la lógica de actualización de producto
    const { id_ingrediente, nombre_producto, costo_producto } = req.body;

    try {
        const existingProducto = await poolQuery('SELECT * FROM ingredientes WHERE nombre_ingrediente = ? AND costo_ingrediente = ? AND id_ingrediente != ?',
            [nombre_producto, costo_producto, id_ingrediente]
        );

        if (existingProducto.length > 0) {
            return res.render('links/productos', {
                title: 'Productos',
                errors: [{ msg: 'Se repiten los datos' }],
                data: req.body
            });
        }

        await poolQuery('UPDATE ingredientes SET nombre_ingrediente = ?, costo_ingrediente = ? WHERE id_ingrediente = ?',
            [nombre_producto, costo_producto, id_ingrediente]
        );

        res.render('links/productos', {
            title: 'Productos',
            success_msg: 'Producto actualizado correctamente',
            error_msg: null
        });
    } catch (err) {
        console.error(err);
        res.render('links/productos', {
            title: 'Productos',
            success_msg: null,
            error_msg: 'Error al actualizar producto'
        });
    }
});

// Ruta para eliminar un producto por nombre
router.post('/eliminar-producto', [
    body('nombre_ingrediente').notEmpty().withMessage('Falta el nombre del producto')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('links/productos', {
            title: 'Productos',
            errors: errors.array(),
            data: req.body 
        });
    }

    const { nombre_ingrediente } = req.body;

    try {
        const existingProducto = await poolQuery('SELECT * FROM ingredientes WHERE nombre_ingrediente = ?', [nombre_ingrediente]);

        if (existingProducto.length === 0) {
            return res.render('links/productos', {
                title: 'Productos',
                errors: [{ msg: 'El producto no existe' }],
                data: req.body
            });
        }

        await poolQuery('DELETE FROM ingredientes WHERE nombre_ingrediente = ?', [nombre_ingrediente]);

        res.render('links/productos', {
            title: 'Productos',
            success_msg: 'Producto eliminado correctamente',
            error_msg: null
        });
    } catch (err) {
        console.error(err);
        res.render('links/productos', {
            title: 'Productos',
            success_msg: null,
            error_msg: 'Error al eliminar producto'
        });
    }
});

router.get('/produccion', (req, res) => {
    res.render('links/produccion', {
        title: 'Produccion',
        errors: [],
        data: {}
    });
});

router.get('/ventas', (req, res) => {
    res.render('links/ventas', {
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