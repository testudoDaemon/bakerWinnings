async function buscarUsuario(event) {
    event.preventDefault();
    const idusuario = document.getElementById('idusuario').value;

    try {
        const response = await fetch('/links/buscar-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idusuario })
        });

        if (!response.ok) {
            throw new Error('Usuario no encontrado');
        }

        const data = await response.json();
        document.getElementById('num_empleado').value = data.num_empleado;
        document.getElementById('nombre').value = data.nombre;
        document.getElementById('apellido_paterno').value = data.apellido_paterno;
        document.getElementById('apellido_materno').value = data.apellido_materno;
        document.getElementById('correo').value = data.correo;
        document.getElementById('telefono').value = data.telefono;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al buscar el usuario');
    }
}

async function actualizarUsuario(event) {
    event.preventDefault();
    const idusuario = document.getElementb('num_empleado').value;
    const nombre = document.getElementById('nombre').value;
    const apellido_paterno = document.getElementById('apellido_paterno').value;
    const apellido_materno = document.getElementById('apellido_materno').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;

    try {
        const response = await fetch('/links/actualizar-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ num_empleado, nombre, apellido_paterno, apellido_materno, correo, telefono })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el usuario');
        }
        window.location.href = '/links/editar';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el usuario');
    }
}