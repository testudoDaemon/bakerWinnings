const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const morgan = require('morgan');
const passport = require('passport');
const Handlebars = require('handlebars');
const {database} = require('./keys')
const { body } = require('express-validator');


// inicializa express
const app = express();
require('./lib/passport');


// configuracion de puerto
// configuracion de motor de busqueda de vistas con handlebars
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

const hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
});

app.engine('.hbs', hbs.engine); // configuracion del motor de busqueda de vistas
app.set('view engine', '.hbs'); // ejecucion del motor de busqueda de vistas

// middlewares (funciones que se ejecutan antes de llegar a las rutas
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 dia
    }
}));
app.use(flash()); // mensajes flash
app.use(morgan('dev')); // muestra por consola las peticiones http
app.use(express.urlencoded({ extended: false })); // para recibir datos de formularios
app.use(passport.initialize());
app.use(express.json());
app.use(passport.session());

// varaibles globales
// midelware para mensajes flash
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    next();
});

// rutas
app.use(require('./routes'));
app.use(require('./routes/authentication')); // ruta para autenticacion de usuarios
app.use('/links', require('./routes/links')); // ruta para enlaces, almacenarlos y mostrarlos


// archivos estaticos

app.use(express.static(path.join(__dirname, 'public')));

// Ejecutar servidor 

app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});
