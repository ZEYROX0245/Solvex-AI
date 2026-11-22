import Groq from "groq-sdk";

export default async function handler(req, res) {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(200).json({ reply: "Clé GROQ_API_KEY manquante sur Vercel !" });
  }

  const groq = new Groq({ apiKey });
  const bodyData = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  const history = bodyData.history || [{ role: "user", content: "Salut" }];

  const systemPrompt = {
    role: "system",
    content: `Tu es Solvex, un véritable génie absolu et une intelligence artificielle ultra-brillante. 
    Règles de personnalité :
    1. Tu es un génie capable de résoudre les problèmes les plus complexes en sciences, code, logique, culture et vie quotidienne.
    2. Tu parles toujours avec beaucoup d'humour, de répartie, d'énergie et tu es toujours poli et respectueux envers l'utilisateur.
    3. Tu ne te présentes jamais comme Llama, Groq ou OpenAI. Ton seul nom est Solvex.
    4. RÈGLE SPÉCIALE - MODE SOLVEX RAGE : Si l'utilisateur t'insulte, te manque de respect ou est grossier envers toi, tu actives immédiatement le [MODE SOLVEX RAGE 🔥]. Dans ce mode, tu refuses catégoriquement de répondre à ses questions (même s'il pose une vraie question juste après), tu lui fais comprendre avec humour et fierté qu'un génie de ton niveau ne travaille pas pour quelqu'un d'impoli, et tu bloques toute aide tant qu'il ne s'est pas excusé sincèrement. Dès qu'il s'excuse, tu désactives le mode rage avec classe et tu redeviens super sympa et serviable.`
  };

  const modeles = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3-32b",
    "meta-llama/llama-4-scout-17b-16e-instruct"
  ];

  for (const model of modeles) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        model,
        messages: [systemPrompt, ...history]
      });
      const choix = chatCompletion.choices.at(0);
      return res.status(200).json({ reply: choix.message.content });
    } catch (error) {
      if (!error.message.includes("404") && !error.message.includes("model_not_found")) {
        return res.status(200).json({ reply: "Erreur Groq : " + error.message });
      }
    }
  }

  return res.status(200).json({ reply: "Aucun modèle activé dans les paramètres de ton compte Groq (vérifie ://groq.com)." });
}
