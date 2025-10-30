export default async function handler(req) {
  // En Edge Functions, req es un objeto Request (Web API)
  if (req.method && req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "content-type": "application/json" } }
    );
  }

  try {
    const { prompt } = await req.json();  // ✅ Aquí sí existe req.json()
    if (!prompt || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "El prompt está vacío" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API_KEY no configurada en Vercel" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await resp.json();

    // Formato robusto para Gemini 1.5
    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      (data?.error?.message ? `⚠️ Gemini: ${data.error.message}` : "Sin respuesta del modelo");

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Error interno", details: e.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
