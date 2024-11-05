document.addEventListener('DOMContentLoaded', () => {
    // Función para mostrar mensajes en la interfaz
    function showMessage(message, type, duration = 4000) {
        const messageElement = document.getElementById('instant-message');
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, duration);
    }

    // Validación para permitir solo letras
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

    // Validación para permitir solo números
    function allowOnlyNumbers(event) {
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);

        if (!/^\d+$/.test(charStr)) {
            event.preventDefault();
            showMessage('Solo se pueden ingresar números', 'danger');
        }
    }

    // Evita que se puedan pegar datos en un input
    function preventPaste(event) {
        event.preventDefault();
        showMessage('No se permite pegar datos', 'danger');
    }

    // Verifica que el largo del input no supere el máximo permitido
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

    // Función para agregar múltiples eventos a un input
    function addInputEventListeners(inputId, events) {
        const input = document.getElementById(inputId);
        if (input) { // Verificación para evitar errores si el ID no existe
            events.forEach(event => {
                input.addEventListener(event.type, event.handler);
            });
        } else {
            console.warn(`Input con ID "${inputId}" no encontrado.`);
        }
    }

    // Asignación de eventos a cada input del formulario de creación
    addInputEventListeners('nombre_ingrediente', [
        { type: 'keypress', handler: allowOnlyLetters },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 15, 'nombre-warning') }
    ]);

    addInputEventListeners('costo_ingrediente', [
        { type: 'keypress', handler: allowOnlyNumbers },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 4, 'costo-warning') }
    ]);

    addInputEventListeners('cantidad_ingrediente', [
        { type: 'keypress', handler: allowOnlyNumbers },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 4, 'cantidad-warning') }
    ]);

    // Asignación de eventos a cada input del formulario de actualización
    addInputEventListeners('nombre_ingrediente_actualizar', [
        { type: 'keypress', handler: allowOnlyLetters },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 10, 'nombre-actualizar-warning') }
    ]);

    addInputEventListeners('costo_ingrediente_actualizar', [
        { type: 'keypress', handler: allowOnlyNumbers },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 4, 'costo-actualizar-warning') }
    ]);

    addInputEventListeners('cantidad_ingrediente_actualizar', [
        { type: 'keypress', handler: allowOnlyNumbers },
        { type: 'paste', handler: preventPaste },
        { type: 'input', handler: (event) => validateInputLength(event, 4, 'cantidad-actualizar-warning') }
    ]);

    // Configura el botón de cancelar para resetear el formulario
    document.getElementById('cancelButton').addEventListener('click', () => {
        document.getElementById('userForm').reset();
    });
});