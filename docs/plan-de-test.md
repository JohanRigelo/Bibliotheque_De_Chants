# Plan de test — Bibliothèque de chants

| Champ | Valeur |
|---|---|
| Application | Bibliothèque de chants (React 19, Vite 8, Tailwind v4, Firebase Firestore) |
| Version testée | branche `main` |
| Auteur | Johan Rigelo |
| Date | 15/10/2026 |

## 1. Objectif

Vérifier que l'application permet de gérer des chants et des listes sans perte de données, que l'affichage ChordPro place chaque accord au-dessus de la bonne syllabe et que la transposition produit les bons accords. Le plan sert de référence aux tests automatisés (unitaires, composants, end-to-end) et aux rapports d'anomalie.

## 2. Périmètre

### Dans le périmètre

| Module | Pages / fichiers | Fonctionnalités |
|---|---|---|
| Bibliothèque | `Bibliotheque.jsx` | affichage des chants, recherche par titre |
| Gestion des chants | `AjouterChant.jsx`, `ModifierChant.jsx`, `DetailChant.jsx` | créer, modifier, supprimer un chant, validation des champs |
| Affichage ChordPro | `accords.js` (`parseContenu`, `extraireMetadonnees`) | accords au-dessus des paroles, balises `{t:}`, `{st:}`, `{c:}`, `{key:}` |
| Transposition | `accords.js` (`transposeAccord`), `DetailChant.jsx` | menu de tonalités, dièses, bémols, retour à l'original |
| Listes | `MesListes.jsx`, `DetailListe.jsx`, modale de `DetailChant.jsx` | créer, supprimer une liste, ajouter et retirer un chant, navigation précédent / suivant |

### Hors périmètre

- Mode nuit (`ThemeToggle.jsx`) : cosmétique, testé seulement en vérification visuelle.
- Performance et montée en charge.
- Sécurité de Firestore (règles d'accès) : non versionnées dans le repo, à auditer séparément.
- Responsive mobile.

## 3. Types de tests

| Niveau | Outil | Cible | Pourquoi |
|---|---|---|---|
| Unitaire | Vitest | fonctions pures de `accords.js` | rapide, sans navigateur ni base : c'est là que se trouve la logique musicale |
| Composant | Vitest + React Testing Library | formulaire d'ajout, `DetailChant`, menu de transposition | vérifie le rendu et les interactions sans lancer toute l'application ; Firestore est simulé (mock) |
| End-to-end | Playwright (Chromium, Firefox) | parcours utilisateur complets | vérifie l'application réelle dans un vrai navigateur |
| Exploratoire | manuel | cas limites, ergonomie | trouve ce que les scripts ne cherchent pas |

Pyramide visée : beaucoup de tests unitaires, moins de tests de composants, quelques scénarios E2E sur les parcours critiques.

## 4. Environnement de test

| Élément | Valeur |
|---|---|
| OS | Windows 11 (local), Ubuntu (CI GitHub Actions) |
| Node.js | 20 |
| Navigateurs | Chromium, Firefox (via Playwright) |
| Serveur | `npm run dev` (Vite, `http://localhost:5173`) |
| Données | base Firestore **de test**, jamais la base de production (voir §8) |

## 5. Critères d'entrée

- Le projet s'installe (`npm install`) et se construit (`npm run build`) sans erreur.
- La base de test est disponible et vide ou dans un état connu.
- Les fonctionnalités du périmètre sont livrées sur `main`.

## 6. Critères de sortie

- 100 % des cas de priorité **Haute** exécutés et passés.
- Au moins 90 % des cas de priorité **Moyenne** passés.
- Aucune anomalie de gravité **Bloquante** ou **Majeure** ouverte sans contournement documenté.
- Chaque anomalie trouvée fait l'objet d'une issue GitHub.
- Les tests automatisés passent en CI sur Chromium et Firefox.

## 7. Cas de test

Priorités : **H** = Haute (parcours critique, perte de données), **M** = Moyenne, **B** = Basse.

### 7.1 Gestion des chants

| ID | Fonctionnalité | Préconditions | Étapes | Résultat attendu | Priorité |
|---|---|---|---|---|---|
| CT-CH-01 | Créer un chant | Page d'accueil ouverte | 1. Cliquer « Ajouter un chant » 2. Saisir le titre « Test QA » 3. Choisir la tonalité G 4. Saisir `[G]Bonjour [C]monde` 5. Cliquer « Enregistrer » | Retour à la bibliothèque, « Test QA » apparaît avec « Tonalité : G » | H |
| CT-CH-02 | Balise `{key:}` automatique | Formulaire d'ajout ouvert | 1. Saisir un contenu 2. Choisir la tonalité D | La première ligne du contenu devient `{key:D}` ; changer à nouveau la tonalité remplace la ligne au lieu d'en ajouter une | M |
| CT-CH-03 | Annuler la création | Formulaire d'ajout ouvert, champs remplis | Cliquer « Annuler » | Retour à la bibliothèque, aucun chant créé | M |
| CT-CH-04 | Modifier un chant | Un chant « Test QA » existe | 1. Ouvrir le chant 2. Cliquer « Modifier » 3. Changer le titre en « Test QA modifié » 4. Enregistrer | Retour au détail, le nouveau titre est affiché ; il apparaît aussi dans la bibliothèque | H |
| CT-CH-05 | Supprimer un chant | Un chant existe | 1. Ouvrir le chant 2. Cliquer « Supprimer » 3. Confirmer | Retour à la bibliothèque, le chant n'y figure plus | H |
| CT-CH-06 | Annuler une suppression | Un chant existe | 1. Cliquer « Supprimer » 2. Cliquer « Annuler » | La modale se ferme, le chant est toujours là | M |
| CT-CH-07 | Rechercher un chant | Plusieurs chants existent | Taper une partie du titre, en minuscules | Seuls les chants dont le titre contient le texte s'affichent, sans tenir compte de la casse | M |
| CT-CH-08 | Recherche sans résultat | Bibliothèque ouverte | Taper « zzzz » | Message « Aucun chant trouvé. » | B |

### 7.2 Cas limites des formulaires

| ID | Fonctionnalité | Préconditions | Étapes | Résultat attendu | Priorité |
|---|---|---|---|---|---|
| CT-LIM-01 | Titre vide | Formulaire d'ajout ouvert | Laisser le titre vide, remplir le contenu, enregistrer | Message « Merci de remplir le titre et le contenu du chant. », aucun chant créé | H |
| CT-LIM-02 | Contenu vide | Formulaire d'ajout ouvert | Remplir le titre, laisser le contenu vide, enregistrer | Même message, aucun chant créé | H |
| CT-LIM-03 | Titre composé d'espaces | Formulaire d'ajout ouvert | Titre « &nbsp;&nbsp;&nbsp; », contenu rempli, enregistrer | Refusé comme un titre vide | M |
| CT-LIM-04 | Titre très long | Formulaire d'ajout ouvert | Titre de 300 caractères, enregistrer | Chant créé, titre affiché sans casser la mise en page | B |
| CT-LIM-05 | Caractères spéciaux | Formulaire d'ajout ouvert | Titre `Ô Seigneur <b>"l'été"</b> & ç`, enregistrer | Titre affiché tel quel, sans interprétation HTML | M |
| CT-LIM-06 | Chant sans accords | Formulaire d'ajout ouvert | Contenu sans crochets, enregistrer puis ouvrir | Paroles affichées normalement, sans ligne d'accords vide parasite | M |
| CT-LIM-07 | Crochet non fermé | Formulaire d'ajout ouvert | Contenu `[G Bonjour`, enregistrer puis ouvrir | Pas de plantage, le texte est affiché | B |
| CT-LIM-08 | Chant inexistant | Aucun | Ouvrir `/chant/id-qui-nexiste-pas` | Message « Chant introuvable » et lien de retour | M |

### 7.3 Affichage ChordPro

| ID | Fonctionnalité | Préconditions | Étapes | Résultat attendu | Priorité |
|---|---|---|---|---|---|
| CT-CP-01 | Placement des accords | Chant avec `[G]Amazing [C]grace` | Ouvrir le chant | G est au-dessus de « Amazing », C au-dessus de « grace » | H |
| CT-CP-02 | Accord en milieu de mot | Chant avec `A[D]mour` | Ouvrir le chant | D est au-dessus de « mour », « A » n'a pas d'accord | M |
| CT-CP-03 | Balises masquées | Chant contenant `{key:G}`, `{soc}`, `{eoc}` | Ouvrir le chant | Ces lignes ne sont pas affichées | M |
| CT-CP-04 | Métadonnées | Contenu avec `{t:Titre}`, `{st:Auteur}`, deux `{c:...}` | Ouvrir le chant | Titre issu de `{t:}`, sous-titre affiché, les deux commentaires affichés | M |
| CT-CP-05 | Ligne vide | Contenu avec une ligne vide entre deux couplets | Ouvrir le chant | Un espace vertical sépare les couplets | B |

### 7.4 Transposition

| ID | Fonctionnalité | Préconditions | Étapes | Résultat attendu | Priorité |
|---|---|---|---|---|---|
| CT-TR-01 | Transposer +1 | Chant en C avec `[C]` `[G]` `[Am]` | Choisir C# dans le menu | Accords affichés : C#, G#, A#m | H |
| CT-TR-02 | Transposer −1 | Même chant | Choisir B | Accords : B, F#, G#m | H |
| CT-TR-03 | Retour à l'original | Chant transposé | Choisir « C (Original) » | Accords d'origine C, G, Am | H |
| CT-TR-04 | Passage de B à C | Chant en B avec `[B]` | Transposer +1 | Accord C (bouclage de la gamme) | H |
| CT-TR-05 | Accords en bémol | Chant avec `[Bb]` `[Eb]` | Transposer +2 | Accords C et F | H |
| CT-TR-06 | Suffixes conservés | Chant avec `[Am7]` `[Gsus4]` `[Cmaj7]` | Transposer +2 | Bm7, Asus4, Dmaj7 | H |
| CT-TR-07 | Accord avec basse | Chant avec `[D/F#]` | Transposer +2 | E/G# (la basse est transposée aussi) | M |
| CT-TR-08 | Menu mineur | Chant en Am | Ouvrir le menu | 12 tonalités mineures uniquement, « Am (Original) » sélectionnée | M |
| CT-TR-09 | Accord non reconnu | Chant avec `[N.C.]` | Transposer +2 | `N.C.` affiché sans modification | B |
| CT-TR-10 | Tonalité affichée | Chant en G | Transposer | « Tonalité de base : G » reste affichée, le menu montre la tonalité choisie | B |

### 7.5 Listes

| ID | Fonctionnalité | Préconditions | Étapes | Résultat attendu | Priorité |
|---|---|---|---|---|---|
| CT-LS-01 | Créer une liste vide | Page « Mes listes » | 1. « Nouvelle liste » 2. Nom « Dimanche » 3. « Créer » | « Dimanche » apparaît avec « 0 chant(s) » | H |
| CT-LS-02 | Nom de liste vide | Modale de création ouverte | Cliquer « Créer » sans nom | Message « Merci de donner un nom à la liste. » | M |
| CT-LS-03 | Ajouter un chant à une liste | Un chant et une liste existent | 1. Ouvrir le chant 2. « Ajouter à une liste » 3. Choisir la liste | Confirmation, la liste affiche 1 chant | H |
| CT-LS-04 | Créer une liste depuis un chant | Un chant existe | Dans la modale, saisir un nom puis « Créer et ajouter » | Nouvelle liste créée contenant ce chant | M |
| CT-LS-05 | Doublon dans une liste | Le chant est déjà dans la liste | L'ajouter à nouveau | Message « Ce chant est déjà dans cette liste ! », pas de doublon | M |
| CT-LS-06 | Retirer un chant | Liste contenant 2 chants | Cliquer ✕ sur un chant, confirmer | Le chant disparaît de la liste mais reste dans la bibliothèque | H |
| CT-LS-07 | Supprimer une liste | Une liste avec des chants | Cliquer la corbeille, confirmer | La liste disparaît, les chants restent dans la bibliothèque | H |
| CT-LS-08 | Navigation dans une liste | Liste de 3 chants | Ouvrir le 1er chant, « Suivant » deux fois | Compteur 1/3, 2/3, 3/3 ; « Précédent » grisé au début, « Suivant » grisé à la fin | M |
| CT-LS-09 | Chant supprimé présent dans une liste | Liste de 3 chants, le 2e est supprimé | Ouvrir la liste, puis naviguer avec Suivant / Précédent | La liste affiche 2 chants, le compteur indique /2, la navigation ne mène jamais à un chant supprimé | M |

## 8. Risques et points d'attention

| Risque | Impact | Mesure |
|---|---|---|
| Les tests E2E écrivent dans Firestore | Des tests lancés sur la base de production créeraient et supprimeraient de vraies données | Utiliser une base de test isolée (émulateur Firebase ou projet Firebase dédié), choix fait à l'étape E2E |
| Pas d'authentification, règles Firestore non versionnées | Si les règles sont ouvertes, n'importe qui peut modifier ou vider la base | Vérifier les règles dans la console Firebase, hors périmètre de ce plan |
| Messages d'erreur via `alert()` | Les dialogues natifs doivent être interceptés explicitement dans Playwright | Écouter l'événement `dialog` dans les tests |
| Pas de sélecteurs dédiés aux tests | Tests fragiles si l'on cible les classes CSS | Cibler les rôles et libellés accessibles (`getByRole`, `getByLabel`), ce qui suppose de relier les `<label>` aux champs |

## 9. Livrables

- Ce plan de test.
- Tests unitaires et de composants (`src/**/*.test.js(x)`).
- Tests E2E Playwright et leur rapport HTML (artefact CI).
- Issues GitHub pour chaque anomalie, sur le modèle `.github/ISSUE_TEMPLATE/bug.md`.
