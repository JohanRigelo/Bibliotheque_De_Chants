// ============================================
// LISTE DES NOTES MUSICALES
// On a deux façons d'écrire les dièses (# et b)
// Ex: C# et Db sont la même note
// ============================================

// Gamme avec dièses (#)
const GAMME_DIESE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Gamme avec bémols (b)
const GAMME_BEMOL = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// ============================================
// FONCTION : transposeAccord
// Prend un accord (ex: "Am") et un nombre de demi-tons (ex: 2)
// Retourne l'accord transposé (ex: "Bm")
// ============================================
export function transposeAccord(accord, demiTons) {

  // On cherche d'abord la note de base dans l'accord
  // Un accord peut être : "C", "Am", "F#m", "Bb7", etc.
  // On essaie d'abord de lire 2 caractères (ex: "C#", "Bb") puis 1 (ex: "C", "A")
  let note = "";
  let suffixe = ""; // le reste de l'accord après la note (ex: "m", "7", "maj7")

  if (accord.length >= 2 && (accord[1] === "#" || accord[1] === "b")) {
    // L'accord commence par une note avec dièse ou bémol (ex: "C#m", "Bbmaj7")
    note = accord.slice(0, 2);
    suffixe = accord.slice(2);
  } else {
    // L'accord commence par une note simple (ex: "Am", "G7")
    note = accord.slice(0, 1);
    suffixe = accord.slice(1);
  }

  // On cherche la position de la note dans la gamme
  let index = GAMME_DIESE.indexOf(note);
  if (index === -1) {
    // Si pas trouvé dans les dièses, on cherche dans les bémols
    index = GAMME_BEMOL.indexOf(note);
  }

  // Si la note n'est pas reconnue, on retourne l'accord tel quel
  if (index === -1) return accord;

  // On calcule le nouvel index en ajoutant les demi-tons
  // % 12 permet de "boucler" : après B on revient à C
  const nouvelIndex = ((index + demiTons) % 12 + 12) % 12;

  // On retourne la nouvelle note + le suffixe original
  return GAMME_DIESE[nouvelIndex] + suffixe;
}

// ============================================
// FONCTION : parseContenu
// Prend le contenu brut d'un chant (format ChordPro)
// et le transforme en tableau de lignes
// Chaque ligne est un tableau de "segments"
// Chaque segment contient : { accord, texte }
// ============================================
export function parseContenu(contenu, demiTons = 0) {

  // On sépare le contenu en lignes
  const lignes = contenu.split("\n");

  // Pour chaque ligne, on extrait les accords et le texte
  return lignes.map((ligne) => {

    const segments = [];
    // On cherche les accords entre crochets avec une expression régulière
    // /\[([^\]]+)\]/g trouve tout ce qui est entre [ et ]
    const regex = /\[([^\]]+)\]/g;
    let dernierIndex = 0;
    let match;

    // On parcourt tous les accords trouvés dans la ligne
    while ((match = regex.exec(ligne)) !== null) {
      // Le texte avant cet accord
      const textAvant = ligne.slice(dernierIndex, match.index);
      // L'accord trouvé, transposé si nécessaire
      const accord = transposeAccord(match[1], demiTons);

      segments.push({ accord, texte: textAvant });
      dernierIndex = match.index + match[0].length;
    }

    // Le texte restant après le dernier accord
    const texteRestant = ligne.slice(dernierIndex);
    if (texteRestant || segments.length === 0) {
      segments.push({ accord: "", texte: texteRestant });
    }

    return segments;
  });
}