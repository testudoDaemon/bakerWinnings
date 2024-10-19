document.addEventListener('DOMContentLoaded', () => {

    function showMessage(message, type) {
        const messageElement = document.getElementById('instant-message');
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 4000);
    }

    function allowOnlyNumbers(event) {
        const charCode = event.charCode || event.keyCode;
        const charStr = String.fromCharCode(charCode);

        // Permitir solo números
        if (!/^\d+$/.test(charStr)) {
            event.preventDefault();
            showMessage('Solo se pueden ingresar números', 'danger');
            return;
        }
    }

    const numEmpleado = document.getElementById('num_empleado');
    numEmpleado.addEventListener('keypress', allowOnlyNumbers);

    // Función para cambiar el valor del campo oculto
    function setAction(action) {
        document.getElementById('actionType').value = action;
    }

    // Asignar eventos a los botones
    document.querySelectorAll('.common-button').forEach(button => {
        button.addEventListener('click', event => {
            const action = event.target.getAttribute('data-action');
            setAction(action);
        });
    });

    // Mostrar mensajes instantáneos
    const instantMessage = document.getElementById('instant-message');
    if (instantMessage && instantMessage.textContent.trim() !== '') {
        instantMessage.style.display = 'block';
        setTimeout(() => {
            instantMessage.style.display = 'none';
        }, 5000); // Ocultar el mensaje después de 5 segundos
    }

    // Manejo de flash-messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 4000); // Ocultar el mensaje después de 4 segundos
    });

    // Ocultar mensajes de error después de 4 segundos
    const errorMessages = document.querySelectorAll('#message, .alert-danger');
    errorMessages.forEach(message => {
        setTimeout(() => {
            message.style.display = 'none';
        }, 4000); // Ocultar el mensaje después de 4 segundos
    });


    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    if (successMessage) {
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 4000); // Ocultar el mensaje después de 4 segundos
    }

    if (errorMessage) {
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 4000); // Ocultar el mensaje después de 4 segundos
    }
});