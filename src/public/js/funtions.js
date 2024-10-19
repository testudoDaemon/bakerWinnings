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
        document.getElementById('idusuario').value = data.num_empleado;
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
    const idusuario = document.getElementById('idusuario').value; 
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
            body: JSON.stringify({ num_empleado: idusuario, nombre, apellido_paterno, apellido_materno, correo, telefono })
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

async function eliminarUsuario(event) {
    event.preventDefault();
    const idusuario = document.getElementById('idusuario').value;
    const nombre = document.getElementById('nombre').value;
    const apellido_paterno = document.getElementById('apellido_paterno').value;
    const apellido_materno = document.getElementById('apellido_materno').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;

    try {
        const response = await fetch('/links/eliminar-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idusuario, nombre, apellido_paterno, apellido_materno, correo, telefono })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.errors ? result.errors.map(err => err.msg).join(', ') : result.error);
        }

        alert(result.message);
        // Redirigir o actualizar la página después de la eliminación
        window.location.href = '/links/eliminar';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el usuario: ' + error.message);
    }
}

async function buscarProducto() {
    try {
        const response = await fetch('/links/api/productos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) { 
            throw new Error('Ingredientes no encontrados');
        }

        const data = await response.json();
        generarTabla(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al buscar los ingredientes');
    }
}

function generarTabla(productos) {
    const tablaProductos = document.getElementById('tabla-productos');
    tablaProductos.innerHTML = '';

    productos.forEach(producto => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${producto.nombre_ingrediente}</td>
            <td>${producto.costo_ingrediente}</td>
            <td><button class="btn btn-info">Seleccionar</button></td>
        `;

        // Cuando se hace clic en la fila, llena los campos del formulario de actualización y eliminación
        fila.querySelector('.btn-info').addEventListener('click', () => {
            // Para actualizar
            document.getElementById('idIngrediente').value = producto.id_ingrediente;
            document.getElementById('nombre_ingrediente').value = producto.nombre_ingrediente;
            document.getElementById('costo_ingrediente').value = producto.costo_ingrediente;

            // Para eliminar
            document.getElementById('nombre_ingrediente_eliminar').value = producto.nombre_ingrediente;
        });

        tablaProductos.appendChild(fila);
    });
}

async function editarProducto(event) {
    event.preventDefault();
    const idIngrediente = document.getElementById('idIngrediente').value; 
    const nombre_producto = document.getElementById('nombre_ingrediente').value;
    const costo_producto = document.getElementById('costo_ingrediente').value;

    try {
        const response = await fetch('/links/actualizar-producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_ingrediente: idIngrediente, nombre_producto, costo_producto })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el producto');
        }
        window.location.href = '/links/productos';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el producto');
    }
}

async function eliminarProducto(event) {
    event.preventDefault();
    const nombreIngrediente = document.getElementById('nombre_ingrediente_eliminar').value;

    try {
        const response = await fetch('/links/eliminar-producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre_ingrediente: nombreIngrediente })
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }
        window.location.href = '/links/productos';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
}
// Comienza la busqueda al abrir la ventana
document.addEventListener('DOMContentLoaded', buscarProducto);
document.getElementById('addProductForm').addEventListener('submit', insertarProducto);

