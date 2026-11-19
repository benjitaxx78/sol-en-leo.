exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    const { items } = JSON.parse(event.body);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "El carrito está vacío o no es válido." }),
      };
    }

    // Mapear los productos al formato requerido por Mercado Pago
    const mpItems = items.map((prod) => ({
      title: prod.nombre,
      unit_price: Number(prod.precio),
      quantity: Number(prod.cantidad),
      currency_id: "ARS",
    }));

    // URL base de la web para el retorno tras el pago
    const origin = event.headers.origin || "https://sol-en-leo.netlify.app";

    const preferenceData = {
      items: mpItems,
      back_urls: {
        success: `${origin}/?pago=exito`,
        failure: `${origin}/?pago=error`,
        pending: `${origin}/?pago=pendiente`,
      },
      auto_return: "approved", // Redirige automáticamente cuando el pago es aprobado
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al generar la preferencia en Mercado Pago");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_point: data.init_point }),
    };
  } catch (error) {
    console.error("Error Mercado Pago Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};