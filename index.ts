import { exec, execSync } from "child_process";
import parseString from "./utils/parseString";
import { get } from "http";
import getLlama3Response from "./utils/llama";

let lastCheckedId: number | null = null;
let adbShell: any = null;
let isProcessing = false;

// Initialiser adbShell
const initAdbShell = () => {
  adbShell = exec("adb shell", (error) => {
    if (error) {
      console.error(`Erreur lors de l'initialisation d'ADB: ${error.message}`);
      adbShell = null;
    }
  });
  console.log("ADB shell initialisé.");
};

// Vérifier les nouveaux messages
const checkForNewMessages = async () => {
  if (isProcessing) {
    console.log(
      "Le traitement est déjà en cours. Attente de la prochaine boucle."
    );
    return; // Ne pas lancer un nouveau traitement tant que l'ancien n'est pas terminé
  }

  if (!adbShell) {
    console.log("ADB shell non initialisé, tentative de réinitialisation...");
    initAdbShell();
    return;
  }

  isProcessing = true; // Mettre en verrouillage pour signaler que le traitement est en cours

  exec(
    "adb shell content query --uri content://sms/inbox --projection _id,address,body,date",
    async (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Erreur lors de l'exécution de la commande: ${error.message}`
        );
        isProcessing = false; // Libérer le verrou en cas d'erreur
        return;
      }
      if (stderr) {
        console.error(`Erreur ADB: ${stderr}`);
        isProcessing = false; // Libérer le verrou en cas d'erreur
        return;
      }

      const lines = stdout.trim().split("\n");

      if (lines.length === 0) {
        console.log("Aucun message reçu.");
        isProcessing = false; // Libérer le verrou
        return;
      }

      const lastMessage = lines[0];
      const match = lastMessage.match(/_id=(\d+)/);
      if (match) {
        const messageId = parseInt(match[1], 10);
        console.log("Dernier message reçu:", messageId);
        console.log("ID du dernier message:", lastCheckedId);
        if (lastCheckedId === null || messageId !== lastCheckedId) {
          console.log("Nouveau message reçu !");
          const data = parseString(lastMessage);
          if (data) {
            console.log("Données du message:", data);
            //const datastr = "repond avec une tres courte reponsea cette question : " + data.body;
            const res = await getLlama3Response(data.body);
            await sendSmsWithAdbWtihPromise(data.address, res);
            lastCheckedId = parseInt(data._id, 10);
          }
        }
      }

      isProcessing = false; // Libérer le verrou après la fin du traitement
    }
  );
};

// Fonction pour envoyer un SMS
function sendSmsWithAdbWtihPromise(
  phoneNumber: string,
  message: string
): Promise<void> {
  console.log("sendSmsWithAdbWtihPromise");
  return new Promise((resolve, reject) => {
    try {
      execSync(
        `adb shell am start -a android.intent.action.SENDTO -d sms:${phoneNumber}`
      );
      console.log(message.replace(/ /g, "%s"));
      const messageToSend = message.replace(/ /g, "%s");
      execSync(`adb shell input text ${messageToSend}`);
      execSync("adb shell input tap 1000 2100");
      execSync("adb shell input tap 1000 1235");
      console.log(`📩 SMS envoyé à ${phoneNumber}: "${message}"`);
      resolve();
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du SMS:", error);
      reject(error);
    }
  });
}

// Initialiser adbShell
initAdbShell();

//Lancer la surveillance des SMS toutes les 5 secondes
console.log("Surveillance des SMS en cours...");
setInterval(async () => {
  console.log("checkForNewMessages");
  await checkForNewMessages();
}, 5000);

// await sendSmsWithAdbWtihPromise("+33649905187", "Salut le pote").then(() => {
//   console.log("SMS envoyé");
// });
