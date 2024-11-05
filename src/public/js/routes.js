document.addEventListener('DOMContentLoaded', function () {
    const cardProduccion = document.querySelector('.card-produccion');
    const cardPedidos = document.querySelector('.card-pedidos');
    const cardVentas = document.querySelector('.card-ventas');
    const cardInventario = document.querySelector('.card-inventario');
    const cardFinanzas = document.querySelector('.card-finanzas');

    const navHome = document.getElementById('nav-home');
    const navProduccion = document.getElementById('nav-produccion');
    const navVentas = document.getElementById('nav-ventas');
    const navPedidos = document.getElementById('nav-pedidos');

    if (navHome) {
        navHome.addEventListener('click', function () {
            window.location.href = '/links/home';
        });
    }

    if (navProduccion) {
        navProduccion.addEventListener('click', function () {
            window.location.href = '/links/produccion';
        });
    }

    if (navVentas) {
        navVentas.addEventListener('click', function () {
            window.location.href = '/links/ventas';
        });
    }

    if (navPedidos) {
        navPedidos.addEventListener('click', function () {
            window.location.href = '/links/pedidos';
        });
    }


    if (cardProduccion) {
        cardProduccion.addEventListener('click', function () {
            window.location.href = '/links/produccion';
        });
    }

    if (cardPedidos) {
        cardPedidos.addEventListener('click', function () {
            window.location.href = '/pedidos';
        });
    }

    if (cardVentas) {
        cardVentas.addEventListener('click', function () {
            window.location.href = '/links/ventas';
        });
    }

    if (cardInventario) {
        cardInventario.addEventListener('click', function () {
            window.location.href = '/links/ingredientes';
        });
    }

    if (cardFinanzas) {
        cardFinanzas.addEventListener('click', function () {
            window.location.href = '/finanzas';
        });
    }

});