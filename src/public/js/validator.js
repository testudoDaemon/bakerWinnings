document.addEventListener('DOMContentLoaded', () => {
    // Función para permitir solo letras
    function allowOnlyLetters(event) {
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);
        const inputValue = event.target.value;

        if (
            !/^[a-zA-Z]+$/.test(charStr) &&
            !(charStr === ' ' && /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(inputValue + charStr))
        ) {
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

    // Función para verificar la longitud del número al perder el foco
    function validatePhoneNumberLength(event) {
        const input = event.target;

        if (input.value === '') {
            input.classList.remove('is-valid', 'is-invalid');
            return;
        }

        if (input.value.length !== 10) {
            showMessage('El número debe tener exactamente 10 dígitos', 'danger');
        }
    }

    // Función para validar el correo electrónico
    function allowOnlyEmail(event) {
        const emailValue = event.target.value;
        const emailInput = event.target;

        if (emailValue === '') {
            emailInput.classList.remove('is-valid', 'is-invalid');
            return;
        }

        if (!emailValue.includes('@')) {
            showMessage('Falta el símbolo @ en el correo', 'danger');
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
        } else if (!emailValue.split('@')[1].includes('.')) {
            showMessage('Falta el punto en el dominio', 'danger');
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailValue)) {
            showMessage('Formato de correo inválido', 'danger');
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
        } else {
            showMessage('Correo válido', 'success');
            emailInput.classList.add('is-valid');
            emailInput.classList.remove('is-invalid');
        }
    }

    // Función para prevenir pegar datos
    function preventPaste(event) {
        event.preventDefault();
        showMessage('No se permite pegar datos', 'danger');
    }

    // Función para mostrar mensajes
    function showMessage(message, type) {
        const messageElement = document.getElementById('instant-message');
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 4000);
    }

    // Función para validar la longitud del input
    function validateInputLength(event, maxLength, warningId) {
        const input = event.target;
        const warningMessage = document.getElementById(warningId);

        if (input.value.length >= maxLength) {
            warningMessage.style.display = 'block';
            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    }

    // Función para agregar eventos a los inputs
    function addInputEventListeners(inputId, events) {
        const input = document.getElementById(inputId);
        events.forEach(event => {
            input.addEventListener(event.type, event.handler);
        });
    }

    // Asignar eventos a los inputs
    addInputEventListeners('idusuario', [
        { type: 'paste', handler: preventPaste },
        { type: 'keypress', handler: allowOnlyNumbers },
        { type: 'input', handler: (event) => validateInputLength(event, 3, 'id-usuario-warning') }
    ]);

    addInputEventListeners('nombre', [
        { type: 'keypress', handler: allowOnlyLetters },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 25, 'nombre-warning') }
    ]);

    addInputEventListeners('apellido_paterno', [
        { type: 'keypress', handler: allowOnlyLetters },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 25, 'apellido-paterno-warning') }
    ]);

    addInputEventListeners('apellido_materno', [
        { type: 'keypress', handler: allowOnlyLetters },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 25, 'apellido-materno-warning') }
    ]);

    addInputEventListeners('correo', [
        { type: 'input', handler: allowOnlyEmail },
        { type: 'blur', handler: allowOnlyEmail },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 20, 'email-warning') }
    ]);

    addInputEventListeners('telefono', [
        { type: 'keypress', handler: allowOnlyNumbers },
        { type: 'blur', handler: validatePhoneNumberLength },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 10, 'phone-warning') }
    ]);

    addInputEventListeners('contrasena', [
        { type: 'input', handler: (event) => validateInputLength(event, 14, 'password-warning') }
    ]);

    // Botón de cancelar (resetea el formulario)
    document.getElementById('cancelButton').addEventListener('click', () => {
        document.getElementById('userForm').reset();
    });
});