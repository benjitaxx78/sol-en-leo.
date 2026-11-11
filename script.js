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
// Cargar productos creados en Decap CMS desde archivos .md
async function cargarProductosCMS() {
  const container = document.getElementById('lista-productos');
  if (!container) return;

  try {
    // 1. Decap CMS genera los nombres de archivo basados en los slugs o títulos.
    // Si tenés una lista de productos o querés probar cargando los archivos:
    // Reemplazá este array con los nombres de tus archivos .md guardados en contenido/productos
    const archivosProductos = [
      'banana.md' // Poné acá el nombre exacto de tu archivo .md en GitHub
    ];

    container.innerHTML = ''; 

    for (const nombreArchivo of archivosProductos) {
      const res = await fetch(`/contenido/productos/${nombreArchivo}`);
      if (!res.ok) continue;
      
      const textoMarkdown = await res.text();

      // Extraer el frontmatter (los datos entre --- y ---)
      const partes = textoMarkdown.split('---');
      if (partes.length < 3) continue;

      const datosYAML = partes[1];
      const prod = jsyaml.load(datosYAML); // Convierte el YAML a objeto JavaScript

      const article = document.createElement('article');
      article.classList.add('producto');
      article.setAttribute('data-price', `$${prod.precio}`);
      article.setAttribute('data-stock', prod.stock);
      article.setAttribute('data-description', prod.descripcion || '');

      article.innerHTML = `
        <button class="producto-detalle" type="button" aria-label="Ver detalles de ${prod.titulo}" onclick="abrirModal('${prod.titulo}', '$${prod.precio}', '${prod.imagen}', '${prod.descripcion || ''}')">
          <img src="${prod.imagen}" alt="${prod.titulo}">
          <span>${prod.titulo}</span>
        </button>
        <p class="precio">$${prod.precio}</p>
        <button class="estado-stock" type="button">Consultar stock</button>
      `;
      container.appendChild(article);
    }
  } catch (error) {
    console.error('Error al cargar productos desde archivos .md:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarProductosCMS);