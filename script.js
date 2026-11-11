const botonMenu = document.querySelector(".boton-menu");
const opcionesMenu = document.querySelector("#opciones-menu");

botonMenu.addEventListener("click", () => {
    const menuAbierto = botonMenu.getAttribute("aria-expanded") === "true";
    botonMenu.setAttribute("aria-expanded", String(!menuAbierto));
    botonMenu.setAttribute("aria-label", menuAbierto ? "Abrir menú" : "Cerrar menú");
    opcionesMenu.hidden = menuAbierto;
});

opcionesMenu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) {
        opcionesMenu.hidden = true;
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !opcionesMenu.hidden) {
        opcionesMenu.hidden = true;
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");
        botonMenu.focus();
    }
});

const modalProducto = document.querySelector("#detalle-producto");
const botonCerrarModal = modalProducto.querySelector(".cerrar-modal");
const nombreModal = modalProducto.querySelector("#detalle-nombre");
const imagenModal = modalProducto.querySelector(".imagen-modal");
const precioModal = modalProducto.querySelector(".precio-modal");
const stockModal = modalProducto.querySelector(".stock-modal");
const descripcionModal = modalProducto.querySelector(".descripcion-modal");

document.querySelectorAll(".producto").forEach((producto) => {
    const botonStock = producto.querySelector(".estado-stock");
    const stockInformado = (producto.dataset.stock || "").trim().toLowerCase();
    const stock = ["si", "sí", "en stock", "stock disponible", "disponible"].includes(stockInformado)
        ? "si"
        : ["no", "sin stock", "agotado", "agotada"].includes(stockInformado)
            ? "no"
            : "consultar";
    const precioTarjeta = producto.querySelector(".precio");
    const precio = (producto.dataset.price || "").trim() || "Consultar precio";
    const etiquetasStock = {
        si: "En stock",
        no: "Sin stock",
        consultar: "Consultar stock",
    };

    precioTarjeta.textContent = precio;

    botonStock.dataset.stock = stock;
    botonStock.textContent = etiquetasStock[stock] || etiquetasStock.consultar;
    botonStock.setAttribute("aria-label", `${botonStock.textContent}: ver detalles del producto`);

    const abrirDetalle = () => {
        const botonDetalle = producto.querySelector(".producto-detalle");
        const nombre = botonDetalle.querySelector("span").textContent.trim();

        nombreModal.textContent = nombre;
        imagenModal.src = botonDetalle.querySelector("img").src;
        imagenModal.alt = nombre;
        precioModal.textContent = `Precio: ${producto.dataset.price || "Consultar precio"}`;
        stockModal.textContent = `Disponibilidad: ${etiquetasStock[stock] || etiquetasStock.consultar}`;
        descripcionModal.textContent = producto.dataset.description || "Descripción pendiente de completar.";
        modalProducto.showModal();
    };

    producto.querySelector(".producto-detalle").addEventListener("click", abrirDetalle);
    botonStock.addEventListener("click", abrirDetalle);
});

botonCerrarModal.addEventListener("click", () => modalProducto.close());
modalProducto.addEventListener("click", (evento) => {
    if (evento.target === modalProducto) {
        modalProducto.close();
    }
});