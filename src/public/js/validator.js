document.addEventListener('DOMContentLoaded', () => {
    // Función para permitir solo letras
    function allowOnlyLetters(event) {
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);
        if (!/^[a-zA-Z]+$/.test(charStr)) {
            event.preventDefault();
            showMessage('Solo se pueden ingresar letras', 'danger');
        }
    }

    // Función para permitir solo números
    function allowOnlyNumbers(event) {
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);
        if (!/^\d+$/.test(charStr)) {
            event.preventDefault();
            showMessage('Solo se pueden ingresar números', 'danger');
        }
    }

    function allowOnlyEmail(event) {
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(charStr)) {
            event.preventDefault();
            showMessage('Solo se pueden ingresar correos', 'danger');
        }
    }


    // Función para prevenir pegar datos
    function preventPaste(event) {
        event.preventDefault();
    }

    // Función para mostrar mensajes
    function showMessage(message, type) {
        const messageElement = document.getElementById('instant-message');
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type}`; // Asigna la clase según el tipo de mensaje (error, success, etc.)
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 4000);
    }

    // Añadir eventos a los inputs correspondientes
    const nombreInput = document.getElementById('nombre');
    const apellidoPaternoInput = document.getElementById('apellido_paterno');
    const apellidoMaternoInput = document.getElementById('apellido_materno');
    //const correoInput = document.getElementById('correo');
    const telefonoInput = document.getElementById('telefono');

    nombreInput.addEventListener('keypress', allowOnlyLetters);
    apellidoPaternoInput.addEventListener('keypress', allowOnlyLetters);
    apellidoMaternoInput.addEventListener('keypress', allowOnlyLetters);
    //correoInput.addEventListener('keypress', allowOnlyEmail);
    telefonoInput.addEventListener('keypress', allowOnlyNumbers);

    // Añadir eventos para prevenir pegar datos
    nombreInput.addEventListener('paste', preventPaste);
    apellidoPaternoInput.addEventListener('paste', preventPaste);
    apellidoMaternoInput.addEventListener('paste', preventPaste);
    correoInput.addEventListener('paste', preventPaste);
    telefonoInput.addEventListener('paste', preventPaste);
});