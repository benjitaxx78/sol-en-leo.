const botonMenu = document.querySelector(".boton-menu");
const opcionesMenu = document.querySelector("#opciones-menu");

if (botonMenu && opcionesMenu) {
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
}

// Configuración del modal de productos
const modalProducto = document.querySelector("#detalle-producto");
const botonCerrarModal = modalProducto ? modalProducto.querySelector(".cerrar-modal") : null;
const nombreModal = modalProducto ? modalProducto.querySelector("#detalle-nombre") : null;
const imagenModal = modalProducto ? modalProducto.querySelector(".imagen-modal") : null;
const precioModal = modalProducto ? modalProducto.querySelector(".precio-modal") : null;
const stockModal = modalProducto ? modalProducto.querySelector(".stock-modal") : null;
const descripcionModal = modalProducto ? modalProducto.querySelector(".descripcion-modal") : null;

if (modalProducto && botonCerrarModal) {
  botonCerrarModal.addEventListener("click", () => modalProducto.close());
  modalProducto.addEventListener("click", (evento) => {
    if (evento.target === modalProducto) {
      modalProducto.close();
    }
  });
}

// Función global para abrir el modal desde cualquier tarjeta
function abrirModalProducto(nombre, precio, imagen, stockRaw, descripcion) {
  if (!modalProducto) return;

  const stockInformado = (stockRaw || "").trim().toLowerCase();
  const stockKey = ["si", "sí", "en stock", "stock disponible", "disponible"].includes(stockInformado)
    ? "si"
    : ["no", "sin stock", "agotado", "agotada"].includes(stockInformado)
      ? "no"
      : "consultar";

  const etiquetasStock = {
    si: "En stock",
    no: "Sin stock",
    consultar: "Consultar stock",
  };

  nombreModal.textContent = nombre;
  imagenModal.src = imagen;
  imagenModal.alt = nombre;
  precioModal.textContent = `Precio: ${precio}`;
  stockModal.textContent = `Disponibilidad: ${etiquetasStock[stockKey]}`;
  descripcionModal.textContent = descripcion || "Descripción pendiente de completar.";

  modalProducto.showModal();
}

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
      const precioFormateado = prod.precio ? `$${prod.precio.toString().replace('$', '')}` : 'Consultar precio';
      
      let imagenUrl = prod.imagen || '';
      if (imagenUrl.startsWith('/')) {
        imagenUrl = imagenUrl.substring(1);
      }

      const stockRaw = prod.stock || 'si';
      let textoStock = 'En stock';
      if (stockRaw === 'no') textoStock = 'Sin stock';
      if (stockRaw === 'consultar') textoStock = 'Consultar stock';

      const article = document.createElement('article');
      article.classList.add('producto');
      article.setAttribute('data-price', precioFormateado);
      article.setAttribute('data-stock', stockRaw);
      article.setAttribute('data-description', prod.descripcion || '');

      article.innerHTML = `
        <button class="producto-detalle" type="button" aria-label="Ver detalles de ${tituloProducto}">
          <img src="${imagenUrl}" alt="${tituloProducto}">
          <span>${tituloProducto}</span>
        </button>
        <p class="precio">${precioFormateado}</p>
        <button class="estado-stock" type="button">${textoStock}</button>
      `;

      const abrirDetalle = () => {
        abrirModalProducto(
          tituloProducto,
          precioFormateado,
          imagenUrl,
          stockRaw,
          prod.descripcion
        );
      };

      article.querySelector('.producto-detalle').addEventListener('click', abrirDetalle);
      article.querySelector('.estado-stock').addEventListener('click', abrirDetalle);

      container.appendChild(article);
    }
  } catch (error) {
    console.error('Error al cargar productos dinámicos:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarProductosCMS);