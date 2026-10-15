import { describe, it, expect } from "vitest";
import {
  transposeAccord,
  parseContenu,
  extraireMetadonnees,
  mettreAJourTagKey,
} from "./accords";

// Les identifiants entre crochets (ex: [CT-TR-01]) renvoient aux cas de test
// de docs/plan-de-test.md.
//
// it.fails : test qui décrit le comportement ATTENDU mais qui échoue
// aujourd'hui à cause d'un bug connu. Vitest le compte comme réussi tant
// qu'il échoue, et le signale dès qu'il se met à passer : on saura alors
// que le bug est corrigé et qu'il faut remplacer it.fails par it.

// Garde uniquement les accords d'un résultat de parseContenu (sans les vides)
const accordsDe = (lignes) =>
  lignes.flat().map((s) => s.accord).filter(Boolean);

describe("transposeAccord", () => {
  describe("cas nominaux", () => {
    it("[CT-TR-01] transpose un accord majeur d'un demi-ton vers le haut", () => {
      expect(transposeAccord("C", 1)).toBe("C#");
    });

    it("transpose d'un ton vers le haut", () => {
      expect(transposeAccord("C", 2)).toBe("D");
    });

    it("[CT-TR-02] transpose d'un demi-ton vers le bas", () => {
      expect(transposeAccord("D", -1)).toBe("C#");
    });

    it("renvoie l'accord inchangé avec 0 demi-ton", () => {
      expect(transposeAccord("Am7", 0)).toBe("Am7");
    });

    // it.each : un même test exécuté sur chaque ligne du tableau
    it.each([
      ["Am", 2, "Bm"],
      ["Am7", 2, "Bm7"],
      ["Gsus4", 2, "Asus4"],
      ["Cmaj7", 2, "Dmaj7"],
      ["C#m", 1, "Dm"],
    ])("[CT-TR-06] conserve le suffixe : %s +%i → %s", (accord, demiTons, attendu) => {
      expect(transposeAccord(accord, demiTons)).toBe(attendu);
    });
  });

  describe("cas limites", () => {
    it("[CT-TR-04] boucle après B vers C", () => {
      expect(transposeAccord("B", 1)).toBe("C");
    });

    it("boucle avant C vers B", () => {
      expect(transposeAccord("C", -1)).toBe("B");
    });

    it("revient au même accord après une octave (+12 ou -12)", () => {
      expect(transposeAccord("G", 12)).toBe("G");
      expect(transposeAccord("G", -12)).toBe("G");
    });

    it("gère un décalage supérieur à une octave", () => {
      expect(transposeAccord("C", 14)).toBe("D");
    });

    it.each([
      ["Bb", 2, "C"],
      ["Eb", 2, "F"],
      ["Ab", 1, "A"],
    ])("[CT-TR-05] reconnaît les bémols : %s +%i → %s", (accord, demiTons, attendu) => {
      expect(transposeAccord(accord, demiTons)).toBe(attendu);
    });

    it.fails("[CT-TR-07] transpose aussi la basse d'un accord renversé (BUG)", () => {
      expect(transposeAccord("D/F#", 2)).toBe("E/G#");
    });
  });

  describe("cas d'erreur", () => {
    it.each(["N.C.", "H", "x"])(
      "[CT-TR-09] renvoie tel quel un accord non reconnu : %s",
      (accord) => {
        expect(transposeAccord(accord, 2)).toBe(accord);
      }
    );

    it("renvoie une chaîne vide si l'accord est vide", () => {
      expect(transposeAccord("", 2)).toBe("");
    });
  });
});

describe("parseContenu", () => {
  describe("cas nominaux", () => {
    it.fails("[CT-CP-01] place chaque accord au-dessus du texte qui le suit (BUG)", () => {
      expect(parseContenu("[G]Amazing [C]grace")).toEqual([
        [
          { accord: "G", texte: "Amazing " },
          { accord: "C", texte: "grace" },
        ],
      ]);
    });

    it.fails("[CT-CP-02] gère un accord au milieu d'un mot (BUG)", () => {
      expect(parseContenu("A[D]mour")).toEqual([
        [
          { accord: "", texte: "A" },
          { accord: "D", texte: "mour" },
        ],
      ]);
    });

    it("produit une ligne par ligne de texte", () => {
      expect(parseContenu("[G]un\n[C]deux")).toHaveLength(2);
    });

    it("transpose les accords quand on passe un nombre de demi-tons", () => {
      const lignes = parseContenu("[C]Bonjour [G]le [Am]monde", 2);
      expect(accordsDe(lignes)).toEqual(["D", "A", "Bm"]);
    });

    it("[CT-CP-03] masque les balises ChordPro {key:}, {soc}, {eoc}", () => {
      const lignes = parseContenu("{key:G}\n{soc}\n[G]Refrain\n{eoc}");
      expect(lignes).toHaveLength(1);
      expect(accordsDe(lignes)).toEqual(["G"]);
    });
  });

  describe("cas limites", () => {
    it("[CT-LIM-06] affiche une ligne sans accords comme un seul segment", () => {
      expect(parseContenu("Juste des paroles")).toEqual([
        [{ accord: "", texte: "Juste des paroles" }],
      ]);
    });

    it("[CT-CP-05] conserve une ligne vide entre deux couplets", () => {
      const lignes = parseContenu("Couplet 1\n\nCouplet 2");
      expect(lignes).toHaveLength(3);
      expect(lignes[1]).toEqual([{ accord: "", texte: "" }]);
    });

    it("[CT-LIM-07] laisse tel quel un crochet non fermé", () => {
      expect(parseContenu("[G Bonjour")).toEqual([
        [{ accord: "", texte: "[G Bonjour" }],
      ]);
    });

    it("renvoie une ligne vide pour un contenu vide", () => {
      expect(parseContenu("")).toEqual([[{ accord: "", texte: "" }]]);
    });
  });

  describe("cas d'erreur", () => {
    // Un chant sans champ "contenu" dans Firestore ferait planter DetailChant
    it("lève une erreur si le contenu est absent", () => {
      expect(() => parseContenu(undefined)).toThrow(TypeError);
    });
  });
});

describe("extraireMetadonnees", () => {
  it("[CT-CP-04] extrait titre, sous-titre et plusieurs commentaires", () => {
    const contenu = "{t:Amazing Grace}\n{st:John Newton}\n{c:Domaine public}\n{c:1779}\n[G]Amazing";
    expect(extraireMetadonnees(contenu)).toEqual({
      titre: "Amazing Grace",
      sousTitre: "John Newton",
      commentaires: ["Domaine public", "1779"],
    });
  });

  it("accepte les formes longues et ignore la casse", () => {
    const meta = extraireMetadonnees("{TITLE:Titre}\n{Subtitle:Auteur}\n{comment:Note}");
    expect(meta.titre).toBe("Titre");
    expect(meta.sousTitre).toBe("Auteur");
    expect(meta.commentaires).toEqual(["Note"]);
  });

  it("supprime les espaces autour des valeurs", () => {
    expect(extraireMetadonnees("{t:   Mon titre   }").titre).toBe("Mon titre");
  });

  it("renvoie des valeurs vides quand il n'y a aucune balise", () => {
    expect(extraireMetadonnees("[G]Bonjour")).toEqual({
      titre: "",
      sousTitre: "",
      commentaires: [],
    });
  });

  it("ignore une balise sans valeur", () => {
    expect(extraireMetadonnees("{t:}").titre).toBe("");
  });
});

describe("mettreAJourTagKey", () => {
  it("[CT-CH-02] ajoute {key:} en première ligne s'il est absent", () => {
    expect(mettreAJourTagKey("[G]Bonjour", "D")).toBe("{key:D}\n[G]Bonjour");
  });

  it("[CT-CH-02] remplace {key:} existant sans créer de doublon", () => {
    expect(mettreAJourTagKey("{key:C}\n[G]Bonjour", "D")).toBe("{key:D}\n[G]Bonjour");
  });

  it("remplace la balise même si elle est écrite en majuscules", () => {
    expect(mettreAJourTagKey("{KEY:C}\nParoles", "Am")).toBe("{key:Am}\nParoles");
  });

  it("fonctionne sur un contenu vide", () => {
    expect(mettreAJourTagKey("", "G")).toBe("{key:G}\n");
  });
});
