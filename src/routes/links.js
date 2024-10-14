const express = require('express');
const router = express.Router();
const pool = require('../database');
const { use } = require('passport');
const { body, validationResult } = require('express-validator');
const { data } = require('autoprefixer');
const helpers = require('../lib/helpers');
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

        req.flash('success', 'Usuario Insertado Correctamente');
        res.redirect('/links/add');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error al insertar el usuario');
        res.status(500).send('Error adding user');
    }
});


router.post('/buscar-usuario', async (req, res) => {
    const { idusuario } = req.body;
    console.log("ID Usuario recibido:", idusuario);  // Log to verify that the server receives the ID

    try {
        const usuarioResult = await pool.query(
            'SELECT num_empleado, nombre, apellido_paterno, apellido_materno FROM Usuarios WHERE num_empleado = ?',
            [idusuario]
        );
        console.log("Usuario encontrado:", usuarioResult);  // Log to see the user data

        if (!usuarioResult || usuarioResult.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = usuarioResult[0];

        const correoResult = await pool.query(
            'SELECT correo FROM Correos WHERE id_correo = (SELECT id_correo FROM Usuarios WHERE num_empleado = ?)',
            [idusuario]
        );
        console.log("Correo encontrado:", correoResult);

        const telefonoResult = await pool.query(
            'SELECT telefono FROM Telefonos WHERE id_telefono = (SELECT id_telefono FROM Usuarios WHERE num_empleado = ?)',
            [idusuario]
        );
        console.log("Teléfono encontrado:", telefonoResult);
        req.flash('success', 'Usuario encontrado');
        res.json({
            num_empleado: usuario.num_empleado,
            nombre: usuario.nombre,
            apellido_paterno: usuario.apellido_paterno,
            apellido_materno: usuario.apellido_materno,
            correo: correoResult.length > 0 ? correoResult[0].correo : '',
            telefono: telefonoResult.length > 0 ? telefonoResult[0].telefono : ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user');
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

    body('nombre').notEmpty().withMessage('Falta nombre'),                      // con el campo Buscar, no se puede modificar el ID
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

            req.flash('success', 'Datos del empleado actualizados');
            res.redirect('/links/modificar_usuarios');
        } catch (err) {
            console.error('Error al actualizar el usuario:', err);
            req.flash('error', 'Error al actualizar el usuario');
            res.redirect('/links/modificar_usuarios');
        }
    
      // Simula un retraso de 5 segundos
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

router.get('/eliminar', (req, res) => {
    res.render('links/eliminar_usuarios', {
        title: 'Eliminar Usuarios',
        errors: [],
        data: {}
    });
});

// Ruta para manejar la eliminación de usuarios
router.post('/eliminar-usuario', [
    body('idusuario').notEmpty().withMessage('Por favor, ingrese el ID del usuario'),
    body('nombre').notEmpty().withMessage('Falta nombre'),
    body('apellido_paterno').notEmpty().withMessage('Falta apellido paterno'),
    body('apellido_materno').notEmpty().withMessage('Falta apellido materno'),
    body('correo').isEmail().withMessage('Falta correo'),
    body('telefono').notEmpty().withMessage('Falta teléfono')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });

        setTimeout(() => {
            res.redirect('eliminar-usuario', {errors: []});
        }, 5000);
        return;
    }
    const { idusuario } = req.body;

    try {
        await queryAsync('DELETE FROM Usuarios_contrasena WHERE num_empleado = ?', [idusuario]);
        await queryAsync('DELETE FROM Usuarios WHERE num_empleado = ?', [idusuario]);
        await queryAsync('DELETE FROM Correos WHERE id_correo = ?', [idusuario]);
        await queryAsync('DELETE FROM Telefonos WHERE id_telefono = ?', [idusuario]);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
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