export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Recibe el prompt desde el frontend
    const { prompt } = req.body;

    // Valida que exista un prompt
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "El prompt está vacío" });
    }

    // Llama a la API de Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();

    // ✅ Manejo moderno del formato de Gemini (2025)
    let textResponse = "";

    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0]?.content?.parts;
      if (Array.isArray(parts) && parts.length > 0 && parts[0].text) {
        textResponse = parts[0].text;
      } else {
        textResponse = "No se encontró texto en la respuesta de Gemini 😢";
      }
    } else {
      textResponse = "No hubo respuesta del modelo Gemini 😕";
    }

    // Envía la respuesta al frontend
    res.status(200).json({ reply: textResponse });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({
      error: "Error interno en el servidor",
      details: error.message,
    });
  }
}
