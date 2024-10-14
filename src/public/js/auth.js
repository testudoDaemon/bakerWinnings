document.addEventListener('DOMContentLoaded', () => {
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
});
