const axios = require("axios");

// Clé API Groq (remplace avec ta clé)
//const API_KEY = process.env.GROQ_API_KEY;
async function getLlama3Response(prompt) {
  console.log("Prompt:", prompt);
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192", // Ou "llama3-8b-8192" selon tes besoins
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization:
            "Bearer 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",
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Réponse de Llama 3 :",
      response.data.choices[0].message.content
    );
    console.log(response.data);
  } catch (error) {
    console.error(
      "Erreur API Groq:",
      error.response ? error.response.data : error.message
    );
  }
}

// Exemple d'utilisation
getLlama3Response("Nganda def");
