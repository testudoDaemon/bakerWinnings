document.addEventListener('DOMContentLoaded', () => {
    // Función para permitir solo letras
    function allowOnlyLetters(event) {
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);
        const inputValue = event.target.value;

        // Permitir letras o un espacio solo si:
        // 1. Es una letra
        // 2. Es un espacio solo si hay algo antes y no hay espacio al final
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
        const input = event.target;
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);

        // Permitir solo números
        if (!/^\d+$/.test(charStr)) {
            event.preventDefault();
            showMessage('Solo se pueden ingresar números', 'danger');
            return;
        }
    }


    // Función para verificar la longitud del número al perder el foco
    function validatePhoneNumberLength(event) {
        const input = event.target;

        // Si el campo está vacío, no mostrar mensajes de error
        if (input.value === '') {
            input.classList.remove('is-valid', 'is-invalid');
            return;
        }

        if (input.value.length !== 10) {
            showMessage('El número debe tener exactamente 10 dígitos', 'danger');
        }
    }

    function allowOnlyEmail(event) {
        const emailValue = event.target.value;
        const emailInput = event.target;
        const messageElement = document.getElementById('instant-message');

        // Si el campo está vacío, no mostrar mensajes de error
        if (emailValue === '') {
            emailInput.classList.remove('is-valid', 'is-invalid');
            messageElement.style.display = 'none';
            return;
        }

        // Validar si falta el símbolo @
        if (!emailValue.includes('@')) {
            showMessage('Falta el símbolo @ en el correo', 'danger');
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
        }
        // Validar si falta el punto en el dominio
        else if (!emailValue.split('@')[1].includes('.')) {
            showMessage('Falta el punto en el dominio', 'danger');
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
        }
        // Validar si el formato completo es incorrecto
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailValue)) {
            showMessage('Formato de correo inválido', 'danger');
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
        }
        // Si el correo es válido
        else {
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

    // Asignar eventos a los inputs
    const idEmpleadoInput = document.getElementById('idusuario');
    const nombreInput = document.getElementById('nombre');
    const apellidoPaternoInput = document.getElementById('apellido_paterno');
    const apellidoMaternoInput = document.getElementById('apellido_materno');
    const correoInput = document.getElementById('correo');
    const telefonoInput = document.getElementById('telefono');

    // Solo letras en nombre y apellidos
    nombreInput.addEventListener('keypress', allowOnlyLetters);
    apellidoPaternoInput.addEventListener('keypress', allowOnlyLetters);
    apellidoMaternoInput.addEventListener('keypress', allowOnlyLetters);

    // Solo números en id 
    idEmpleadoInput.addEventListener('keypress', allowOnlyNumbers);

    // Solo números en teléfono
    telefonoInput.addEventListener('keypress', allowOnlyNumbers);
    telefonoInput.addEventListener('blur', validatePhoneNumberLength);

    // Validación en blur o input para correos
    correoInput.addEventListener('input', allowOnlyEmail);
    correoInput.addEventListener('blur', allowOnlyEmail);

    // Prevenir pegar en todos los inputs
    nombreInput.addEventListener('paste', preventPaste);
    apellidoPaternoInput.addEventListener('paste', preventPaste);
    apellidoMaternoInput.addEventListener('paste', preventPaste);
    correoInput.addEventListener('paste', preventPaste);
    telefonoInput.addEventListener('paste', preventPaste);

    // Validación de longitud de caracters
    document.getElementById('idusuario').addEventListener('input', function () {
        const idInput = document.getElementById('idusuario');
        const warningMessage = document.getElementById('id-usuario-warning');
        if (idInput.value.length >= 3) {
            warningMessage.style.display = 'block';
            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    }
    );

    document.getElementById('nombre').addEventListener('input', function () {
        const nameInput = document.getElementById('nombre');
        const warningMessage = document.getElementById('nombre-warning');
        if (nameInput.value.length >= 25) {
            warningMessage.style.display = 'block';

            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    });

    document.getElementById('apellido_paterno').addEventListener('input', function () {
        const lastNameInput = document.getElementById('apellido_paterno');
        const warningMessage = document.getElementById('apellido-paterno-warning');
        if (lastNameInput.value.length >= 25) {
            warningMessage.style.display = 'block';

            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    });

    document.getElementById('apellido_materno').addEventListener('input', function () {
        const lastNameInput = document.getElementById('apellido_materno');
        const warningMessage = document.getElementById('apellido-materno-warning');
        if (lastNameInput.value.length >= 25) {
            warningMessage.style.display = 'block';

            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    });

    document.getElementById('correo').addEventListener('input', function () {
        const emailInput = document.getElementById('correo');
        const warningMessage = document.getElementById('email-warning');
        if (emailInput.value.length >= 20) {
            warningMessage.style.display = 'block';

            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    });


    document.getElementById('telefono').addEventListener('input', function () {
        const phoneInput = document.getElementById('telefono');
        const warningMessage = document.getElementById('phone-warning');
        if (phoneInput.value.length >= 10) {
            warningMessage.style.display = 'block';

            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    });

    document.getElementById('contrasena').addEventListener('input', function () {
        const passwordInput = document.getElementById('contrasena');
        const warningMessage = document.getElementById('password-warning');
        if (passwordInput.value.length >= 14) {
            warningMessage.style.display = 'block';

            setTimeout(() => {
                warningMessage.style.display = 'none';
            }, 4000);
        } else {
            warningMessage.style.display = 'none';
        }
    });

    // Botón de cancelar (resetea el formulario)
    document.getElementById('cancelButton').addEventListener('click', function () {
        document.getElementById('userForm').reset();
    });
});
