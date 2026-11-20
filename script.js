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

// Cargar carrito desde localStorage
const datosGuardados = localStorage.getItem("sol_en_leo_carrito");
const carrito = new Map(datosGuardados ? JSON.parse(datosGuardados) : []);

const botonCarrito = document.querySelector(".boton-carrito");
const contadorCarrito = document.querySelector("#contador-carrito");
const modalCarrito = document.querySelector("#carrito");
const botonCerrarCarrito = modalCarrito ? modalCarrito.querySelector(".cerrar-carrito") : null;
const listaCarrito = modalCarrito ? modalCarrito.querySelector("#lista-carrito") : null;
const carritoVacio = modalCarrito ? modalCarrito.querySelector("#carrito-vacio") : null;
const totalCarrito = modalCarrito ? modalCarrito.querySelector("#total-carrito") : null;
const btnComprarWA = modalCarrito ? modalCarrito.querySelector("#btn-comprar-wa") : null;

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function formatearPrecio(precio) {
  return formatoMoneda.format(precio);
}

function obtenerPrecioNumerico(precio) {
  const digitos = String(precio ?? "").replace(/\D/g, "");
  return digitos ? Number(digitos) : null;
}

function guardarCarrito() {
  localStorage.setItem("sol_en_leo_carrito", JSON.stringify([...carrito]));
}

function renderizarCarrito() {
  if (!listaCarrito || !contadorCarrito || !carritoVacio || !totalCarrito) return;

  listaCarrito.replaceChildren();
  let cantidadTotal = 0;
  let precioTotal = 0;

  for (const [id, producto] of carrito) {
    cantidadTotal += producto.cantidad;
    precioTotal += producto.precio * producto.cantidad;

    const item = document.createElement("li");
    item.className = "item-carrito";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = "";

    const informacion = document.createElement("div");
    informacion.className = "informacion-carrito";
    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;
    const precio = document.createElement("p");
    precio.textContent = `${formatearPrecio(producto.precio)} c/u`;
    informacion.append(nombre, precio);

    const controles = document.createElement("div");
    controles.className = "controles-cantidad";
    const botonRestar = document.createElement("button");
    botonRestar.type = "button";
    botonRestar.dataset.accion = "restar";
    botonRestar.dataset.productoId = id;
    botonRestar.setAttribute("aria-label", `Disminuir cantidad de ${producto.nombre}`);
    botonRestar.textContent = "−";
    const cantidad = document.createElement("span");
    cantidad.textContent = producto.cantidad;
    cantidad.setAttribute("aria-label", `Cantidad: ${producto.cantidad}`);
    const botonSumar = document.createElement("button");
    botonSumar.type = "button";
    botonSumar.dataset.accion = "sumar";
    botonSumar.dataset.productoId = id;
    botonSumar.setAttribute("aria-label", `Aumentar cantidad de ${producto.nombre}`);
    botonSumar.textContent = "+";
    controles.append(botonRestar, cantidad, botonSumar);

    item.append(imagen, informacion, controles);
    listaCarrito.append(item);
  }

  contadorCarrito.textContent = cantidadTotal;
  botonCarrito.setAttribute("aria-label", `Abrir carrito, ${cantidadTotal} productos`);
  carritoVacio.hidden = cantidadTotal > 0;
  totalCarrito.textContent = formatearPrecio(precioTotal);

  const carritoTieneItems = cantidadTotal > 0;
  if (btnComprarWA) btnComprarWA.disabled = !carritoTieneItems;

  guardarCarrito();
}

function agregarAlCarrito(producto) {
  const productoExistente = carrito.get(producto.id);
  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carrito.set(producto.id, { ...producto, cantidad: 1 });
  }
  renderizarCarrito();
}

if (botonCarrito && modalCarrito) {
  botonCarrito.addEventListener("click", (evento) => {
    evento.preventDefault();
    modalCarrito.showModal();
  });
}

if (modalCarrito && botonCerrarCarrito) {
  botonCerrarCarrito.addEventListener("click", () => modalCarrito.close());
  modalCarrito.addEventListener("click", (evento) => {
    if (evento.target === modalCarrito) modalCarrito.close();
  });
}

if (listaCarrito) {
  listaCarrito.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const producto = carrito.get(boton.dataset.productoId);
    if (!producto) return;

    if (boton.dataset.accion === "sumar") {
      producto.cantidad += 1;
    } else {
      producto.cantidad -= 1;
      if (producto.cantidad === 0) carrito.delete(boton.dataset.productoId);
    }

    renderizarCarrito();
  });
}

// Envío de pedido a WhatsApp con aviso de comprobante
if (btnComprarWA) {
  btnComprarWA.addEventListener("click", () => {
    if (carrito.size === 0) return;

    let mensaje = "¡Hola! Realicé la transferencia para el siguiente pedido en Sol en Leo:\n\n";
    let precioTotal = 0;

    for (const [_, prod] of carrito) {
      const subtotal = prod.precio * prod.cantidad;
      precioTotal += subtotal;
      mensaje += `• ${prod.cantidad}x ${prod.nombre} (${formatearPrecio(subtotal)})\n`;
    }

    mensaje += `\n*Monto transferido: ${formatearPrecio(precioTotal)}*\n\n📌 Adjunto el comprobante de transferencia a este mensaje para coordinar el envío.`;

    const numeroTelefono = "5493425994955";
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsApp, "_blank");
  });
}

if (modalProducto && botonCerrarModal) {
  botonCerrarModal.addEventListener("click", () => modalProducto.close());
  modalProducto.addEventListener("click", (evento) => {
    if (evento.target === modalProducto) {
      modalProducto.close();
    }
  });
}

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
      const precioNumerico = obtenerPrecioNumerico(prod.precio);
      
      let imagenUrl = prod.imagen || '';
      if (imagenUrl.startsWith('/')) {
        imagenUrl = imagenUrl.substring(1);
      }

      const stockRaw = prod.stock || 'si';
      const stockInformado = String(stockRaw).trim().toLowerCase();
      const disponible = ["si", "sí", "en stock", "stock disponible", "disponible"].includes(stockInformado);
      let textoStock = 'En stock';
      if (["no", "sin stock", "agotado", "agotada"].includes(stockInformado)) textoStock = 'Sin stock';
      if (!disponible && textoStock !== 'Sin stock') textoStock = 'Consultar stock';

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
        <button class="agregar-carrito" type="button" ${!disponible || precioNumerico === null ? "disabled" : ""}>
          ${!disponible ? "Sin stock" : precioNumerico === null ? "Consultar precio" : "Agregar al carrito"}
        </button>
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
      const botonAgregar = article.querySelector('.agregar-carrito');
      if (disponible && precioNumerico !== null) {
        botonAgregar.addEventListener('click', () => {
          agregarAlCarrito({
            id: item.name,
            nombre: tituloProducto,
            precio: precioNumerico,
            imagen: imagenUrl,
          });
        });
      }

      container.appendChild(article);
    }
  } catch (error) {
    console.error('Error al cargar productos dinámicos:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrito();
  cargarProductosCMS();
});