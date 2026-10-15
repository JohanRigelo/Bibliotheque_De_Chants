# Campagne de test n°1 — exécution manuelle

| Champ | Valeur |
|---|---|
| Référentiel | [plan-de-test.md](plan-de-test.md) (étapes et résultats attendus de chaque cas) |
| Version testée | commit `0f061d4` |
| Environnement | `npm run dev`, http://localhost:5175 |
| Navigateur | Chromium 152 (navigateur intégré à l'app Claude), Windows 11 |
| Testeur | Johan Rigelo (exécution assistée par Claude) |
| Début / fin | 15/10/2026 / 15/10/2026 |

## Règles d'exécution

- Suivre les étapes du plan **à la lettre**, dans l'ordre des tableaux.
- Comparer ce qui s'affiche au **résultat attendu** du plan, pas à ce qu'on pense que l'application devrait faire.
- Tout chant ou liste créé pour un test commence par `[TEST]`. Tout supprimer en fin de campagne.
- Un cas KO → créer une fiche d'anomalie et noter son numéro (ex : `#12`) dans la colonne Anomalie.

## Statuts

| Statut | Signification |
|---|---|
| OK | résultat obtenu conforme au résultat attendu |
| KO | résultat obtenu différent du résultat attendu → fiche d'anomalie |
| Bloqué | impossible d'exécuter le cas (précondition impossible, autre bug qui empêche) |
| NE | non exécuté |

## Jeux de données

À copier-coller dans le champ « Paroles et accords ».

**JD-01 — chant de base (tonalité C)**
```
[C]Amazing [G]grace how [Am]sweet the sound
```

**JD-02 — métadonnées et balises**
```
{t:[TEST] Amazing Grace}
{st:John Newton}
{c:Domaine public}
{c:1779}
{soc}
[G]Amazing [C]grace

A[D]mour
{eoc}
```

**JD-03 — accords variés (tonalité C)**
```
[Am7]un [Gsus4]deux [Cmaj7]trois [D/F#]quatre [N.C.]cinq
```

**JD-04 — bémols**
```
[Bb]un [Eb]deux
```

**JD-05 — cas limites**
- Titre de 300 caractères : `[TEST] ` suivi de 293 fois la lettre `a`
- Caractères spéciaux : `[TEST] Ô Seigneur <b>"l'été"</b> & ç`
- Sans accords : `Juste des paroles sans aucun accord`
- Crochet non fermé : `[G Bonjour`

## Exécution

### Gestion des chants

| ID | Cas | Prio | Résultat | Date | Commentaire | Anomalie |
|---|---|---|---|---|---|---|
| CT-CH-01 | Créer un chant | H | OK | 15/10/2026 | Chant créé, affiché avec « Tonalité : G » |  |
| CT-CH-02 | Balise `{key:}` automatique | M | OK | 15/10/2026 | `{key:D}` ajouté en 1re ligne, remplacé par `{key:G}` sans doublon |  |
| CT-CH-03 | Annuler la création | M | OK | 15/10/2026 |  |  |
| CT-CH-04 | Modifier un chant | H | OK | 15/10/2026 | Nouveau titre affiché sur le détail et dans la bibliothèque |  |
| CT-CH-05 | Supprimer un chant | H | OK | 15/10/2026 | Remarque : depuis une liste, on revient à la bibliothèque et non à la liste |  |
| CT-CH-06 | Annuler une suppression | M | OK | 15/10/2026 |  |  |
| CT-CH-07 | Rechercher un chant | M | OK | 15/10/2026 | Insensible à la casse, accents compris (« ÉTÉ » trouve « été ») |  |
| CT-CH-08 | Recherche sans résultat | B | OK | 15/10/2026 |  |  |

### Cas limites des formulaires

| ID | Cas | Prio | Résultat | Date | Commentaire | Anomalie |
|---|---|---|---|---|---|---|
| CT-LIM-01 | Titre vide | H | OK | 15/10/2026 | Message affiché, on reste sur le formulaire |  |
| CT-LIM-02 | Contenu vide | H | OK | 15/10/2026 |  |  |
| CT-LIM-03 | Titre composé d'espaces | M | OK | 15/10/2026 |  |  |
| CT-LIM-04 | Titre très long | B | KO | 15/10/2026 | Le titre sort de la carte et crée un défilement horizontal de la page | ANO-05 |
| CT-LIM-05 | Caractères spéciaux | M | OK | 15/10/2026 | Balises affichées comme du texte, pas interprétées |  |
| CT-LIM-06 | Chant sans accords | M | KO | 15/10/2026 | Une ligne d'accords vide de 20 px est réservée au-dessus des paroles. Résultat attendu à confirmer | ANO-06 |
| CT-LIM-07 | Crochet non fermé | B | OK | 15/10/2026 | `[G Bonjour` affiché tel quel |  |
| CT-LIM-08 | Chant inexistant | M | KO | 15/10/2026 | « Chargement... » affiché indéfiniment, pas de bouton retour, aucune erreur en console | ANO-03 |

### Affichage ChordPro

| ID | Cas | Prio | Résultat | Date | Commentaire | Anomalie |
|---|---|---|---|---|---|---|
| CT-CP-01 | Placement des accords | H | KO | 15/10/2026 | C au-dessus de rien, G au-dessus de « Amazing », Am au-dessus de « grace how ». Espaces perdus : « Amazinggrace howsweet » | ANO-01, ANO-02 |
| CT-CP-02 | Accord en milieu de mot | M | KO | 15/10/2026 | D affiché au-dessus de « A » au lieu de « mour » | ANO-01 |
| CT-CP-03 | Balises masquées | M | OK | 15/10/2026 |  |  |
| CT-CP-04 | Métadonnées | M | OK | 15/10/2026 |  |  |
| CT-CP-05 | Ligne vide | B | OK | 15/10/2026 |  |  |

### Transposition

| ID | Cas | Prio | Résultat | Date | Commentaire | Anomalie |
|---|---|---|---|---|---|---|
| CT-TR-01 | Transposer +1 | H | OK | 15/10/2026 | C#, G#, A#m |  |
| CT-TR-02 | Transposer −1 | H | OK | 15/10/2026 | B, F#, G#m |  |
| CT-TR-03 | Retour à l'original | H | OK | 15/10/2026 |  |  |
| CT-TR-04 | Passage de B à C | H | OK | 15/10/2026 |  |  |
| CT-TR-05 | Accords en bémol | H | OK | 15/10/2026 | Chant saisi en A# (Bb absent du formulaire), transposé en C : accords C et F |  |
| CT-TR-06 | Suffixes conservés | H | OK | 15/10/2026 | Bm7, Asus4, Dmaj7 |  |
| CT-TR-07 | Accord avec basse | M | KO | 15/10/2026 | `D/F#` +2 donne `E/F#` : la basse n'est pas transposée | ANO-04 |
| CT-TR-08 | Menu mineur | M | OK | 15/10/2026 |  |  |
| CT-TR-09 | Accord non reconnu | B | OK | 15/10/2026 |  |  |
| CT-TR-10 | Tonalité affichée | B | OK | 15/10/2026 |  |  |

### Listes

| ID | Cas | Prio | Résultat | Date | Commentaire | Anomalie |
|---|---|---|---|---|---|---|
| CT-LS-01 | Créer une liste vide | H | OK | 15/10/2026 |  |  |
| CT-LS-02 | Nom de liste vide | M | OK | 15/10/2026 |  |  |
| CT-LS-03 | Ajouter un chant à une liste | H | OK | 15/10/2026 |  |  |
| CT-LS-04 | Créer une liste depuis un chant | M | OK | 15/10/2026 |  |  |
| CT-LS-05 | Doublon dans une liste | M | OK | 15/10/2026 |  |  |
| CT-LS-06 | Retirer un chant | H | OK | 15/10/2026 |  |  |
| CT-LS-07 | Supprimer une liste | H | OK | 15/10/2026 |  |  |
| CT-LS-08 | Navigation dans une liste | M | OK | 15/10/2026 |  |  |
| CT-LS-09 | Chant supprimé présent dans une liste | M | KO | 15/10/2026 | « Mes listes » affiche 3 chant(s), le détail 2. Compteur « 1 / 3 ». « Suivant » mène au chant supprimé, la page garde le chant précédent avec « 2 / 3 » | ANO-07 |

## Synthèse

| | Haute | Moyenne | Basse | Total |
|---|---|---|---|---|
| OK | 15 | 13 | 5 | 33 |
| KO | 1 | 5 | 1 | 7 |
| Bloqué | 0 | 0 | 0 | 0 |
| NE | 0 | 0 | 0 | 0 |
| **Total** | 16 | 18 | 6 | 40 |

Taux de réussite : 82,5 % (33/40).

### Anomalies

Chaque anomalie a son issue GitHub (ANO-0n = issue #n). Gravité : **Bloquante** (fonction inutilisable, pas de contournement), **Majeure** (résultat faux ou perte d'information), **Mineure** (gêne, contournement simple), **Cosmétique** (apparence seulement).

| ID | Titre | Gravité | Cas |
|---|---|---|---|
| [ANO-01](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/1) | Les accords s'affichent au-dessus du texte qui les précède au lieu de celui qui les suit | Majeure | CT-CP-01, CT-CP-02 |
| [ANO-04](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/4) | La basse d'un accord renversé n'est pas transposée (`D/F#` +2 → `E/F#`) | Majeure | CT-TR-07 |
| [ANO-07](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/7) | Un chant supprimé reste dans les listes : compteur faux, et « Suivant » affiche le mauvais chant | Majeure | CT-LS-09 |
| [ANO-08](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/8) | La transposition choisie sur un chant reste appliquée au chant suivant de la liste | Majeure | exploratoire |
| [ANO-02](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/2) | Les espaces entre deux mots disparaissent quand un accord est placé entre eux | Mineure | CT-CP-01 |
| [ANO-03](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/3) | Un chant introuvable affiche « Chargement... » indéfiniment | Mineure | CT-LIM-08 |
| [ANO-05](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/5) | Un titre long sans espace déborde de sa carte | Cosmétique | CT-LIM-04 |
| [ANO-06](https://github.com/JohanRigelo/Bibliotheque_De_Chants/issues/6) | Une ligne d'accords vide est réservée au-dessus des paroles sans accords | Cosmétique | CT-LIM-06 |

ANO-08 a été trouvée hors des cas prévus. Scénario : dans une liste, transposer le 1er chant (B → C#), puis cliquer « Suivant ». Le 2e chant, en C, s'affiche directement en D, alors qu'aucune transposition n'a été choisie pour lui.

ANO-06 dépend d'un choix d'affichage : réserver la ligne garde les paroles alignées d'une ligne à l'autre. Il faut le faire confirmer par le responsable du produit avant de la traiter comme un défaut.

### Autres observations (hors cas de test)

- Accessibilité : les `<label>` des formulaires ne sont pas reliés à leurs champs (pas d'attribut `htmlFor`). Un lecteur d'écran annonce le placeholder au lieu de « Titre du chant ».
- La tonalité `Bb` n'existe pas dans le formulaire, seule `A#` est proposée, alors que les accords en bémol sont reconnus.

### Conclusion

Critères de sortie **non atteints** :
- 1 cas de priorité Haute en échec (CT-CP-01), alors que le plan exige 100 % ;
- 72 % des cas de priorité Moyenne passés (13/18), pour 90 % exigés ;
- 4 anomalies majeures ouvertes.

Avis : **non livrable en l'état**. À corriger en priorité : ANO-01 (touche l'affichage de tous les chants), puis ANO-07 et ANO-08 (risque de jouer les mauvais accords en situation de jeu). Après correction, refaire les cas en échec et une passe de non-régression sur l'affichage ChordPro et la transposition.
