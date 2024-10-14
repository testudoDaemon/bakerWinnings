const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');


passport.use('local.signin', new LocalStrategy({
    usernameField: 'num_empleado',
    passwordField: 'contrasena',
    passReqToCallback: true
}, async (req, num_empleado, contrasena, done) => {
    try {
        console.log("Número de empleado ingresado:", num_empleado);
        console.log("Contraseña ingresada:", contrasena);
        const rows = await pool.query(`
            SELECT u.num_empleado, u.nombre, uc.password 
            FROM Usuarios u 
            JOIN Usuarios_contrasena uc ON u.num_empleado = uc.num_empleado 
            WHERE u.num_empleado = ?
        `, [num_empleado]);

        console.log("Resultado de la consulta:", rows);

        if (rows.length > 0) {
            const user = rows[0];
            console.log("Contraseña en base de datos:", user.password);
            const validPassword = await helpers.matchPassword(contrasena, user.password);

            if (validPassword) {
                done(null, user, req.flash('success', 'Bienvenido ' + user.nombre));
            } else {
                console.log("Contraseña incorrecta");
                done(null, false, req.flash('message', 'Contraseña incorrecta'));
            }
        } else {
            console.log("Usuario no encontrado");
            return done(null, false, req.flash('message', 'El usuario no existe'));
        }
    } catch (err) {
        console.error(err);
        return done(err);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.num_empleado);
});

passport.deserializeUser(async (id, done) => {
    try {
        const rows = await pool.query('SELECT num_empleado, nombre FROM Usuarios WHERE num_empleado = ?', [id]);
        done(null, rows[0]);
    } catch (err) {
        done(err, null);
    }
});
