const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const passport = require('passport');

router.get('/login', (req, res) => {
    res.render('auth/inicio_de_sesion', {
        title: 'Inicio de Sesión',
        stylesheets: ['/css/styles.css'],
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg'),
        error: req.flash('error')
    });
});

router.post('/login', [
    body('num_empleado').notEmpty().withMessage('Falta número de empleado'),
    body('contrasena').notEmpty().withMessage('Falta contraseña')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        let specificErrors = {
            num_empleado: errorArray.find(error => error.param === 'num_empleado'),
            contrasena: errorArray.find(error => error.param === 'contrasena')
        };

        return res.render('auth/inicio_de_sesion', { 
            title: 'Inicio de Sesión',
            stylesheets: ['/css/styles.css'],
            errors: specificErrors, 
            data: req.body
        });
    }

    passport.authenticate('local.signin', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // El mensaje que venga desde info.message será 'Usuario inexistente', 'Contraseña incorrecta', o el nuevo mensaje genérico
            const message = info.message || 'Error de autenticación';
            req.flash('error_msg', message);
            return res.render('auth/inicio_de_sesion', { 
                title: 'Inicio de Sesión',
                stylesheets: ['/css/styles.css'],
                error_msg: message,  // Muestra el mensaje específico en la vista
                data: req.body       // Mantiene los datos ingresados en el formulario
            });
        }
    
        // Si la autenticación es exitosa
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
    
            const actionType = req.body.actionType;
    
            if (actionType === 'ingresar') {
                req.flash('success_msg', 'Inicio de sesión exitoso');
                return res.redirect('/links/home');
            } else if (actionType === 'gestionar') {
                req.flash('success_msg', 'Inicio de sesión exitoso');
                return res.redirect('/links/gestion');
            } else if (actionType === 'registrar') {
                req.flash('success_msg', 'Inicio de sesión exitoso');
                return res.redirect('/register');
            } else {
                req.flash('error_msg', 'Acción no válida');
                return res.render('auth/inicio_de_sesion', { 
                    title: 'Inicio de Sesión',
                    stylesheets: ['/css/styles.css'],
                    error_msg: 'Acción no válida',
                    data: req.body
                });
            }
        });
    })(req, res, next); 
});

module.exports = router;