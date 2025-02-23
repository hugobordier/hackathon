import axios, { type AxiosResponse } from "axios";

// Définition des types pour la réponse
interface Llama3Response {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Clé API Groq (remplace avec ta clé)
const API_KEY = "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";

async function getLlama3Response(prompt: string): Promise<string> {
  //   console.log("Envoi de la requête à Llama 3...");
  try {
    const response: AxiosResponse<Llama3Response> = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Retourner la réponse de Llama 3
    const content = response.data.choices[0]?.message.content;
    if (content) {
      return content;
    } else {
      console.error("Aucun contenu dans la réponse de Llama 3");
    }
  } catch (error: any) {
    console.error(
      "Erreur API Groq:",
      error.response ? error.response.data : error.message
    );
  }
  return "Erreur lors de la récupération de la réponse.";
}

export default getLlama3Response;
