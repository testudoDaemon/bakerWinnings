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
    body('num_empleado').notEmpty().withMessage('Falta numero de empleado'),
    body('contrasena').notEmpty().withMessage('Falta contraseña')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/inicio_de_sesion', { 
            title: 'Inicio de Sesión',
            stylesheets: ['/css/styles.css'],
            errors: errors.array(), 
            data: req.body
        });
    }

    passport.authenticate('local.signin', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            const message = info ? info.message : 'Usuario inexistente';
            req.flash('error_msg', message);
            return res.render('auth/inicio_de_sesion', { 
                title: 'Inicio de Sesión',
                stylesheets: ['/css/styles.css'],
                error_msg: message,
                data: req.body
            });
        }

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