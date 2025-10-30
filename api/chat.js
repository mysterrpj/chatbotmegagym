export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Obtener el prompt del cuerpo de la solicitud
    const { prompt } = req.body;

    // Obtener la API Key desde las variables de entorno o usar respaldo manual (solo para prueba local)
    const apiKey = process.env.API_KEY || "TU_API_KEY_DE_GEMINI_AQUI";

    // Endpoint de Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // Realizar la solicitud al modelo
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    // Leer respuesta de Gemini
    const data = await response.json();

    // Manejar errores de respuesta
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res
        .status(response.status)
        .json({ error: "Gemini API error", details: data });
    }

    // Verificar si hay texto generado
    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude generar una respuesta en este momento.";

    // Devolver la respuesta al frontend
    res.status(200).json({ reply: output });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
