const bcrypt = require('bcryptjs');

// Función para cifrar una contraseña
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10); // Generar el salt (factor de complejidad)
    const hashedPassword = await bcrypt.hash(password, salt); // Cifrar la contraseña
    console.log('Contraseña cifrada:', hashedPassword); // Mostrar la contraseña cifrada
}

// Llamar la función con la contraseña que deseas cifrar
hashPassword('pan1234');
