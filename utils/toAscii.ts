function toASCII(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^ -~]/g, ""); // Supprime les caractères non ASCII
}

//console.log(toASCII("L'étoile filante qui tomba amoureuse d'un nuage 🌟!"));
// Output: "L'etoile filante qui tomba amoureuse d'un nuage !"

export default toASCII;
