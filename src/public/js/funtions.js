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
            <td>${producto.cantidad_ingrediente}</td>
            <td>${producto.tipo_cantidad}</td>
            <td><button class="btn btn-info">Seleccionar</button></td>
        `;

        fila.querySelector('.btn-info').addEventListener('click', () => {
            // Para actualizar
            document.getElementById('idIngredienteActualizar').value = producto.idIngrediente;
            document.getElementById('nombre_ingrediente_actualizar').value = producto.nombre_ingrediente;
            document.getElementById('costo_ingrediente_actualizar').value = producto.costo_ingrediente;
            document.getElementById('cantidad_ingrediente_actualizar').value = producto.cantidad_ingrediente;
            document.getElementById('tipo_cantidad_actualizar').value = producto.tipo_cantidad;
            

            // Para eliminar
            document.getElementById('nombre_ingrediente_eliminar').value = producto.nombre_ingrediente;
        });

        tablaProductos.appendChild(fila);
    });
}


async function editarProducto(event) {
    event.preventDefault();
    const idIngrediente = document.getElementById('idIngredienteActualizar').value; 
    const nombre_producto = document.getElementById('nombre_ingrediente_actualizar').value;
    const costo_producto = document.getElementById('costo_ingrediente_actualizar').value;
    const cantidad_producto = document.getElementById('cantidad_ingrediente_actualizar').value;
    const tipo_cantidad = document.getElementById('tipo_cantidad_actualizar').value;

    try {
        const response = await fetch('/links/actualizar-producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_ingrediente: idIngrediente, nombre_producto, costo_producto, cantidad_producto, tipo_cantidad })
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

