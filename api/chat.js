export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { prompt } = await req.json(); // ✅ CORREGIDO

    const apiKey = process.env.API_KEY; // asegúrate que en Vercel se llama exactamente así
    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY no configurada en entorno" });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();

    if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      console.error("Gemini API error:", data);
      res.status(500).json({ error: "Error de la API de Gemini", details: data });
    }
  } catch (error) {
    console.error("Error del servidor:", error);
    res.status(500).json({ error: error.message });
  }
}
