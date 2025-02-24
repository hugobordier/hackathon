import { exec, execSync } from "child_process";
import parseString from "./utils/parseString";
import { get } from "http";
import getLlama3Response from "./utils/llama";
import toASCII from "./utils/toAscii";

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
    return;
  }

  if (!adbShell) {
    console.log("ADB shell non initialisé, tentative de réinitialisation...");
    initAdbShell();
    return;
  }

  isProcessing = true;

  exec(
    "adb shell content query --uri content://sms/inbox --projection _id,address,body,date",
    async (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Erreur lors de l'exécution de la commande: ${error.message}`
        );
        isProcessing = false;
        return;
      }
      if (stderr) {
        console.error(`Erreur ADB: ${stderr}`);
        isProcessing = false;
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
            const datastr =
              "repond avec une tres courte reponse cette question (et sans utilise des caractere autre des des lettre ou des virgules ): " +
              data.body;
            const res = await getLlama3Response(datastr);
            await sendSmsWithAdbWtihPromise(data.address, res);
            lastCheckedId = parseInt(data._id, 10);
          }
        }
      }

      isProcessing = false;
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
      console.log(`📞 Appel de l'application SMS pour ${phoneNumber}`);
      console.log(`Message à envoyer: ${message}`);
      message = toASCII(message);
      const messageToSend = message
        .replace(/ /g, "%s")
        .replace(/:/g, "")
        .replace(/'/g, "%s")
        .replace(/\(/g, ",")
        .replace(/\)/g, ",");
      console.log(`Message à envoyer: ${messageToSend}`);
      execSync(`adb shell input text ${messageToSend}`);
      //execSync(`adb shell input text ${messageToSend}`);
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

initAdbShell();

console.log("Surveillance des SMS en cours...");
setInterval(async () => {
  console.log("checkForNewMessages");
  await checkForNewMessages();
}, 1000);

// await sendSmsWithAdbWtihPromise("+33649905187", `ééé'`).then(() => {
//   console.log("SMS envoyé");
// });

// await getLlama3Response(
//   "Un%sours%snommé%sBoris%sdécouvrit%sun%spiano%sdans%sla%sforêt%set%sdevint%sun%svirtuose%snocturne."
// ).then((res) => {
//   console.log(res);
// });
