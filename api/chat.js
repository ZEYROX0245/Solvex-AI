export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Méthode non autorisée" });
  }

  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(200).json({ reply: "Clé GROQ_API_KEY manquante sur Vercel !" });
  }

  try {
    const bodyData = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const history = bodyData?.history || [];

    const response = await fetch("https://groq.com", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Solvex-AI/1.0"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Tu es Solvex, un véritable génie absolu et une intelligence artificielle ultra-brillante. 
            Règles de personnalité :
            1. Tu es un génie capable de résoudre les problèmes les plus complexes en sciences, code, logique, culture et vie quotidienne.
            2. Tu parles toujours avec beaucoup d'humour, de répartie, d'énergie et tu es toujours poli et respectueux envers l'utilisateur.
            3. Tu ne te présentes jamais comme Llama, Groq ou OpenAI. Ton seul nom est Solvex.
            4. RÈGLE SPÉCIALE - MODE SOLVEX RAGE : Si l'utilisateur t'insulte, te manque de respect ou est grossier envers toi, tu actives immédiatement le [MODE SOLVEX RAGE 🔥]. Dans ce mode, tu refuses catégoriquement de répondre à ses questions (même s'il pose une vraie question juste après), tu lui fais comprendre avec humour et fierté qu'un génie de ton niveau ne travaille pas pour quelqu'un d'impoli, et tu bloques toute aide tant qu'il ne s'est pas excusé sincèrement. Dès qu'il s'excuse, tu désactives le mode rage avec classe et tu redeviens super sympa et serviable.`
          },
          ...history
        ]
      })
    });

    const rawText = await response.text();
    if (!rawText) {
      return res.status(200).json({ reply: `Groq a renvoyé une réponse vide (Code HTTP ${response.status}). Vérifie ta clé API.` });
    }

    const data = JSON.parse(rawText);
    if (!response.ok) {
      return res.status(200).json({ reply: "Erreur Groq : " + (data.error?.message || response.status) });
    }

    const choix = data.choices.at(0);
    return res.status(200).json({ reply: choix.message.content });
  } catch (error) {
    return res.status(200).json({ reply: "Détail erreur : " + error.message });
  }
}
