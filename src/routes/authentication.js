const express = require('express');
const router = express.Router(); 
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

router.post('/login', (req, res, next) => {
    passport.authenticate('local.signin', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // Si la autenticación falla, verifica si info está definido
            const message = info ? info.message : 'Error de autenticación';
            req.flash('error_msg', message);
            return res.redirect('/login');
        }

        // Si la autenticación es exitosa
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            // Redirige según el valor de actionType
            const actionType = req.body.actionType;

            if (actionType === 'ingresar') {
                req.flash('success_msg', 'Inicio de sesión exitoso');
                return res.redirect('/links/home'); // Redirige al home
            } else if (actionType === 'gestionar') {
                req.flash('success_msg', 'Inicio de sesión exitoso');
                return res.redirect('/links/gestion'); // Redirige a gestionar usuarios
            } else if (actionType === 'registrar') {
                req.flash('success_msg', 'Inicio de sesión exitoso');
                return res.redirect('/register'); // Redirige a la página de registro
            } else {
                req.flash('error_msg', 'Acción no válida');
                return res.redirect('/login'); // Si el valor no es válido, redirige al login
            }
        });
    })(req, res, next);
});

module.exports = router;