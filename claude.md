# Bibliothèque de Chants — Contexte projet

Application React (Vite) + Firebase/Firestore pour gérer une bibliothèque de chants
avec paroles, accords, transposition, et setlists ("Mes listes").

## Stack

- React 19 + React Router 7
- Vite 8
- Firebase / Firestore (voir `src/firebase.js`)
- Tailwind CSS v4 (via `@tailwindcss/vite`) — **en cours de migration**, voir plus bas

## Historique des décisions importantes

### Transposition et tonalités (src/pages/DetailChant.jsx, src/accords.js)

- Un chant est toujours enregistré avec une tonalité de base dans `chant.tonalite`
  (ex: `"C"` pour majeur, `"Am"` pour mineur — le suffixe `"m"` indique le mineur).
- **Le menu de transposition sur la page DetailChant ne propose que des tonalités
  de la même qualité que l'originale** : si le chant est en majeur, seules les
  12 tonalités majeures sont proposées ; s'il est en mineur, seules les 12 tonalités
  mineures. On ne mélange jamais majeur/mineur dans le même menu, et on ne convertit
  jamais un chant majeur en son "parallèle" mineur (ex: C → Cm) car ça n'a pas de
  sens musicalement pour une transposition par demi-tons (ça donnerait 0 demi-ton
  de décalage). Convertir vers la *relative* mineure/majeure serait un décalage de
  3 demi-tons, mais cette fonctionnalité n'est pas implémentée.
- `src/accords.js` contient `transposeAccord`, `parseContenu`, `extraireMetadonnees`,
  et `mettreAJourTagKey` (insère/remplace automatiquement une ligne `{key:...}`
  dans le contenu ChordPro quand la tonalité est changée dans un formulaire).

### Formulaires (src/pages/AjouterChant.jsx, src/pages/ModifierChant.jsx)

- La liste `tonalites` contient 24 valeurs : les 12 majeures puis les 12 mineures
  (`"C", "C#", ..., "B", "Cm", "C#m", ..., "Bm"`).
- Quand l'utilisateur choisit une tonalité dans le `<select>`, `mettreAJourTagKey`
  est appelée pour mettre à jour automatiquement la ligne `{key:...}` en première
  ligne du contenu (import depuis `../accords`).

### Déploiement (vercel.json)

- Le projet est déployé sur Vercel. Un fichier `vercel.json` à la racine contient
  une règle de rewrite (`"/(.*)" → "/index.html"`) pour que le routing côté client
  (React Router) fonctionne au rechargement d'une page (sinon 404 sur toute URL
  autre que `/`).

## Migration Tailwind — état d'avancement

Tailwind v4 est installé et configuré (`@tailwindcss/vite` dans `vite.config.js`,
`@import "tailwindcss";` dans `src/index.css`). Le projet migre progressivement
d'un style 100% inline (`style={{...}}`) vers des classes Tailwind, **une page à
la fois**, en préservant exactement le même rendu visuel (mêmes couleurs, mêmes
espacements) sauf mention contraire.

**Déjà migrées :**
- ✅ `src/pages/Bibliotheque.jsx`
- ✅ `src/pages/AjouterChant.jsx`
- ✅ `src/pages/DetailChant.jsx`
- ✅ `src/pages/ModifierChant.jsx`
- ✅ `src/pages/MesListes.jsx`
- ✅ `src/pages/DetailListe.jsx`

**Migration complète — toutes les pages sont sur Tailwind avec dark mode.**

**Important — bug résolu à ne pas réintroduire :** `src/index.css` contenait à
l'origine tout le CSS par défaut du template Vite (styles `h1`, `h2`, `#root`,
variables `--text-h`, etc.) à l'intérieur d'un commentaire `/* ... */` **jamais
fermé**. Lightning CSS (le parseur utilisé par Vite) est tolérant sur les
commentaires mal fermés et appliquait quand même ces règles, qui écrasaient les
couleurs Tailwind (un `h1 { color: ... }` non "layered" bat toujours une classe
Tailwind qui EST dans une layer, peu importe la spécificité — règle des CSS
Cascade Layers). Ce bloc a été supprimé. `src/index.css` doit rester minimal.

## Mode nuit (dark mode)

Mis en place et actif sur toutes les pages :

- `src/components/PageLayout.jsx` : composant wrapper qui centralise le fond de
  page (`min-h-screen bg-[#f0f4ff] dark:bg-slate-900 p-5`) pour éviter de
  répéter ces classes sur chaque page. Utilisé par `Bibliotheque.jsx`,
  `AjouterChant.jsx`, `ModifierChant.jsx`, `MesListes.jsx` et
  `DetailListe.jsx`. Toute nouvelle page (ou page migrée) doit utiliser
  `<PageLayout>` plutôt que de redéclarer ce `<div>`.
- `src/index.css` contient `@custom-variant dark (&:where(.dark, .dark *));`
  pour piloter le mode sombre par une classe `.dark` sur `<html>` plutôt que
  uniquement par la préférence système.
- `src/ThemeToggle.jsx` : bouton flottant (🌙/☀️) en haut à droite, présent sur
  toutes les pages (monté dans `src/App.jsx`, en dehors de `<Routes>`). Le choix
  est sauvegardé dans `localStorage` (clé `"theme"`), avec fallback sur
  `prefers-color-scheme` si aucun choix n'a été fait.
- **Règle à suivre pour les prochaines migrations** : à chaque fois qu'une page
  est migrée vers Tailwind, ajouter directement les variantes `dark:` en même
  temps (ne pas faire deux passes séparées). Palette utilisée jusqu'ici :
  - fond de page : `bg-[#f0f4ff]` → `dark:bg-slate-900`
  - cartes/fond blanc : `bg-white` → `dark:bg-slate-800`
  - titre principal (bleu) : `text-blue-800` → `dark:text-blue-400`
  - texte foncé standard : `text-slate-800` → `dark:text-slate-100`
  - texte secondaire/gris : `text-slate-500` → `dark:text-slate-400`
  - bordures : `border-slate-300` → `dark:border-slate-600`
  - champs de formulaire : ajouter `dark:bg-slate-700 dark:text-white` en plus
    de la bordure

## Workflow Git
- Toujours faire `git add` et `git commit` après une tâche terminée et testée quand je te le demande
- Ne jamais faire `git push` — je m'en charge manuellement après relecture

## Environnement de dev

- `npm run dev` : serveur de développement (hot reload automatique sur les
  fichiers `.jsx` ; redémarrage nécessaire seulement après modif de
  `vite.config.js`, `package.json`, ou `npm install`)
- `npm run build` : build de production
- Toujours tester en local avant de commit/push. Convention adoptée : un commit
  par page migrée plutôt qu'un gros commit final, pour faciliter le retour en
  arrière si besoin.