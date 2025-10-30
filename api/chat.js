export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  try {
    // Usa process.env.API_KEY (variable en Vercel) o tu clave directa como respaldo
    const apiKey = process.env.API_KEY || "AItzaSyA1m1xmOH_uXlQ8o4TRFTTnEVkhDd_rmY";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: "No response from Gemini API", details: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
