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
    const resLista = await fetch('https://api.github.com/repos/benjitaxx78/sol-en-leo./contents/contenido/productos');
    const archivos = await resLista.json();

    container.innerHTML = ''; 

    for (const item of archivos) {
      if (!item.name.endsWith('.md')) continue;

      const res = await fetch(`/contenido/productos/${item.name}`);
      if (!res.ok) continue;
      
      const textoMarkdown = await res.text();
      const partes = textoMarkdown.split('---');
      if (partes.length < 3) continue;

      const prod = jsyaml.load(partes[1]);
      
      const tituloProducto = prod.title || 'Producto sin título';
      const precioProducto = prod.precio ? prod.precio.toString().replace('$', '') : '0';
      
      let imagenUrl = prod.imagen || '';
      if (imagenUrl.startsWith('/')) {
        imagenUrl = imagenUrl.substring(1);
      }

      let textoStock = 'En stock';
      if (prod.stock === 'no') textoStock = 'Sin stock';
      if (prod.stock === 'consultar') textoStock = 'Consultar stock';

      const article = document.createElement('article');
      article.classList.add('producto');
      article.setAttribute('data-price', `$${precioProducto}`);
      article.setAttribute('data-stock', prod.stock || 'si');
      article.setAttribute('data-description', prod.descripcion || '');

      article.innerHTML = `
        <button class="producto-detalle" type="button" aria-label="Ver detalles de ${tituloProducto}">
          <img src="${imagenUrl}" alt="${tituloProducto}">
          <span>${tituloProducto}</span>
        </button>
        <p class="precio">$${precioProducto}</p>
        <button class="estado-stock" type="button">${textoStock}</button>
      `;

      // Event listener directo para abrir el modal al hacer clic en el boton del producto
      const btnDetalle = article.querySelector('.producto-detalle');
      btnDetalle.addEventListener('click', () => {
        if (typeof abrirModal === 'function') {
          abrirModal(tituloProducto, `$${precioProducto}`, imagenUrl, prod.descripcion || 'Sin descripción disponible.');
        } else if (typeof mostrarDetalle === 'function') {
          mostrarDetalle(article);
        }
      });

      container.appendChild(article);
    }
  } catch (error) {
    console.error('Error al cargar productos dinámicos:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarProductosCMS);

document.addEventListener('DOMContentLoaded', cargarProductosCMS);

document.addEventListener('DOMContentLoaded', cargarProductosCMS);