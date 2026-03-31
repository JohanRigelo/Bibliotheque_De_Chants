// ============================================
// GAMMES MUSICALES
// On définit les 12 notes de la gamme chromatique
// en deux versions : avec dièses (#) et avec bémols (b)
// ============================================

// Version avec dièses : utilisée par défaut pour la transposition
const GAMME_DIESE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Version avec bémols : utilisée pour reconnaître les notes écrites avec un b
const GAMME_BEMOL = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// ============================================
// FONCTION : transposeAccord
// Reçoit un accord (ex: "Am7") et un nombre de demi-tons (ex: 2)
// Retourne l'accord transposé (ex: "Bm7")
//
// Un accord est composé de :
// - une note de base (ex: "A", "C#", "Bb")
// - un suffixe qui décrit le type d'accord (ex: "m", "7", "maj7", "sus4")
// ============================================
export function transposeAccord(accord, demiTons) {

  // Si pas de transposition, on retourne l'accord tel quel
  if (demiTons === 0) return accord;

  let note = "";
  let suffixe = ""; // La partie après la note (ex: "m", "7", "maj7")

  // On vérifie si la note fait 2 caractères (avec # ou b)
  // Ex: "C#m" → note = "C#", suffixe = "m"
  // Ex: "Bbmaj7" → note = "Bb", suffixe = "maj7"
  if (accord.length >= 2 && (accord[1] === "#" || accord[1] === "b")) {
    note = accord.slice(0, 2);
    suffixe = accord.slice(2);
  } else {
    // Sinon la note fait 1 caractère
    // Ex: "Am" → note = "A", suffixe = "m"
    // Ex: "G7" → note = "G", suffixe = "7"
    note = accord.slice(0, 1);
    suffixe = accord.slice(1);
  }

  // On cherche la position de la note dans la gamme avec dièses
  let index = GAMME_DIESE.indexOf(note);

  // Si pas trouvée, on cherche dans la gamme avec bémols
  if (index === -1) index = GAMME_BEMOL.indexOf(note);

  // Si la note n'est toujours pas reconnue, on retourne l'accord sans le modifier
  if (index === -1) return accord;

  // On calcule le nouvel index après transposition
  // % 12 : permet de "boucler" autour des 12 notes (après B on revient à C)
  // + 12 puis % 12 : gère les valeurs négatives (transposition vers le bas)
  const nouvelIndex = ((index + demiTons) % 12 + 12) % 12;

  // On retourne la nouvelle note + le suffixe d'origine (inchangé)
  return GAMME_DIESE[nouvelIndex] + suffixe;
}

// ============================================
// FONCTION : parseContenu
// Reçoit le contenu brut d'un chant en format ChordPro
// et le transforme en structure utilisable pour l'affichage
//
// Format ChordPro : les accords sont entre crochets dans le texte
// Ex: "[G]Amazing [C]grace how [G]sweet the sound"
//
// Résultat : un tableau de lignes, chaque ligne étant
// un tableau de segments { accord, texte }
// Ex: [{ accord: "G", texte: "Amazing " }, { accord: "C", texte: "grace how " }...]
// ============================================
export function parseContenu(contenu, demiTons = 0) {

  // On sépare le contenu en lignes avec \n (retour à la ligne)
  const lignes = contenu.split("\n");

  return lignes
    // On filtre les lignes qui sont des balises ChordPro
    // Ces balises servent à définir des métadonnées dans le format ChordPro
    // Ex: {key:D} = tonalité, {soc} = début de refrain, {eoc} = fin de refrain
    // On les reconnaît car elles commencent par { et finissent par }
    // On les ignore car on ne veut pas les afficher
    .filter((ligne) => !ligne.trim().match(/^\{.*\}$/))

    // Pour chaque ligne restante, on extrait les accords et le texte
    .map((ligne) => {

      const segments = [];

      // Expression régulière pour trouver les accords entre crochets
      // \[ et \] : crochets ouvrant et fermant (échappés car [ et ] ont un sens spécial)
      // ([^\]]+) : capture tout ce qui est entre les crochets (sauf un crochet fermant)
      // /g : trouve TOUTES les occurrences dans la ligne (pas seulement la première)
      const regex = /\[([^\]]+)\]/g;

      let dernierIndex = 0; // Position où on s'est arrêté dans la ligne
      let match; // Résultat de chaque recherche regex

      // On parcourt tous les accords trouvés dans la ligne
      while ((match = regex.exec(ligne)) !== null) {

        // Texte qui se trouve AVANT cet accord
        // Ex: dans "[G]Amazing [C]grace", avant [C] on a "Amazing "
        const textAvant = ligne.slice(dernierIndex, match.index);

        // On transpose l'accord si nécessaire
        const accord = transposeAccord(match[1], demiTons);

        // On ajoute ce segment (accord + texte avant) à la liste
        segments.push({ accord, texte: textAvant });

        // On avance notre position après la fin du crochet fermant
        dernierIndex = match.index + match[0].length;
      }

      // On ajoute le texte restant après le dernier accord
      // Ex: dans "[G]Amazing grace", après [G] il reste "Amazing grace"
      const texteRestant = ligne.slice(dernierIndex);
      if (texteRestant || segments.length === 0) {
        segments.push({ accord: "", texte: texteRestant });
      }

      return segments;
    });

}
// ============================================
// FONCTION : extraireMetadonnees
// Lit le contenu brut du chant et extrait
// les balises de métadonnées ChordPro :
//
// {t:...} ou {title:...}     → titre du chant
// {st:...} ou {subtitle:...} → auteur / sous-titre
// {c:...} ou {comment:...}   → commentaire / copyright
//                               (peut apparaître plusieurs fois)
// ============================================
export function extraireMetadonnees(contenu) {

  const meta = {
    titre: "",
    sousTitre: "",
    commentaires: [] // tableau car il peut y avoir plusieurs {c:}
  };

  contenu.split("\n").forEach((ligne) => {
    const l = ligne.trim();

    // Balise titre : {t:Mon titre} ou {title:Mon titre}
    const matchTitre = l.match(/^\{(?:t|title):(.+)\}$/i);
    if (matchTitre) {
      meta.titre = matchTitre[1].trim();
    }

    // Balise sous-titre : {st:Auteur} ou {subtitle:Auteur}
    const matchSousTitre = l.match(/^\{(?:st|subtitle):(.+)\}$/i);
    if (matchSousTitre) {
      meta.sousTitre = matchSousTitre[1].trim();
    }

    // Balise commentaire/copyright : {c:Texte} ou {comment:Texte}
    // On les accumule dans un tableau car il peut y en avoir plusieurs
    const matchCommentaire = l.match(/^\{(?:c|comment):(.+)\}$/i);
    if (matchCommentaire) {
      meta.commentaires.push(matchCommentaire[1].trim());
    }
  });

  return meta;
}