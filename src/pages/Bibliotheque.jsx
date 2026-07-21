// ============================================
// IMPORTS - On charge les outils dont on a besoin
// ============================================

// useState : permet de créer des variables "réactives"
// Quand une variable useState change, React re-affiche automatiquement la page
// useEffect : permet d'exécuter du code à un moment précis (ici au chargement de la page)
import { useState, useEffect } from "react";

// On importe "db" depuis notre fichier firebase.js
// "db" c'est notre connexion à la base de données Firestore
import { db } from "../firebase";

// collection : permet de pointer vers une collection dans Firebase (ex: "chants")
// getDocs : permet de récupérer tous les documents d'une collection
import { collection, getDocs } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

// ============================================
// COMPOSANT PRINCIPAL
// Un composant React c'est simplement une fonction
// qui retourne du HTML (qu'on appelle JSX en React)
// ============================================
function Bibliotheque() {

  // ============================================
  // VARIABLES D'ÉTAT (useState)
  // ============================================

  // "chants" : la liste des chants récupérés depuis Firebase
  // "setChants" : la fonction pour modifier cette liste
  // [] : valeur de départ = tableau vide (pas encore de chants chargés)
  const [chants, setChants] = useState([]);

  // "recherche" : le texte tapé par l'utilisateur dans la barre de recherche
  // "setRecherche" : la fonction pour modifier ce texte
  // "" : valeur de départ = texte vide
  const [recherche, setRecherche] = useState("");
  const navigate = useNavigate();


  // ============================================
  // CHARGEMENT DES DONNÉES (useEffect)
  // Ce bloc s'exécute UNE SEULE FOIS quand la page s'affiche
  // Le [] à la fin signifie "ne s'exécute qu'au premier affichage"
  // ============================================
  useEffect(() => {

    // On définit une fonction async (asynchrone)
    // "async" signifie que la fonction va attendre une réponse de Firebase
    // sans bloquer le reste de la page
    const recupererChants = async () => {

      // "await" signifie "attends que Firebase réponde avant de continuer"
      // collection(db, "chants") : on pointe vers la collection "chants" dans Firebase
      // getDocs : on récupère tous les documents de cette collection
      const snapshot = await getDocs(collection(db, "chants"));

      // snapshot.docs est un tableau de documents Firebase bruts
      // On les transforme en objets JavaScript simples avec .map()
      // .map() parcourt chaque document et retourne un nouvel objet
      const liste = snapshot.docs.map((doc) => ({
        id: doc.id,      // l'identifiant unique du document (généré par Firebase)
        ...doc.data()    // "..." = on copie tous les champs : titre, tonalite, contenu
      }));

      // On affiche dans la console pour vérifier que ça marche
      console.log("Chants récupérés :", liste);

      // On met la liste dans notre variable "chants"
      // React va automatiquement re-afficher la page avec les nouveaux chants
      setChants(liste);
    };

    // On appelle la fonction qu'on vient de définir
    recupererChants();

  }, []); // [] = dépendances vides = s'exécute une seule fois au chargement


  // ============================================
  // FILTRAGE PAR RECHERCHE
  // Cette ligne crée une nouvelle liste filtrée à partir de "chants"
  // Elle se recalcule automatiquement chaque fois que "recherche" change
  // ============================================

  // .filter() garde uniquement les éléments qui correspondent à la condition
  // .toLowerCase() convertit en minuscules pour ignorer les majuscules
  // .includes() vérifie si le titre contient le texte recherché
  const chantsFiltres = chants.filter((chant) =>
    chant.titre.toLowerCase().includes(recherche.toLowerCase())
  );


  // ============================================
  // AFFICHAGE (le "return" retourne le HTML de la page)
  // Tout ce qui est entre () après return est du JSX
  // JSX = HTML avec du JavaScript dedans
  // ============================================
  return (
    <div className="min-h-screen bg-[#f0f4ff] p-5">

      {/* Titre principal de la page */}
      <h1 className="text-center text-blue-800 text-3xl font-bold mb-6">
        🎵 Bibliothèque de Chants
      </h1>

      {/* Boutons en haut de la bibliothèque */}
      <div className="flex justify-center gap-3 mb-5">

        {/* Bouton pour ajouter un nouveau chant */}
        <button
          onClick={() => navigate("/ajouter")}
          className="px-6 py-2.5 bg-blue-800 text-white border-none rounded-lg text-base cursor-pointer font-semibold"
        >
          ➕ Ajouter un chant
        </button>

        {/* Bouton pour accéder aux setlists */}
        <button
          onClick={() => navigate("/listes")}
          className="px-6 py-2.5 bg-white text-blue-800 border-2 border-blue-800 rounded-lg text-base cursor-pointer font-semibold"
        >
          📋 Mes listes
        </button>

      </div>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un chant..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="block w-full max-w-[500px] mx-auto mb-6 px-4 py-2.5 rounded-lg border border-slate-300 text-base"
      />

      {/* Conteneur de la liste des chants */}
      <div className="max-w-[500px] mx-auto flex flex-col gap-3">

        {chantsFiltres.map((chant) => (
          <div
            key={chant.id}
            onClick={() => navigate(`/chant/${chant.id}`)}
            className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-pointer"
          >
            <h2 className="text-slate-800 text-lg font-semibold">{chant.titre}</h2>
            <p className="text-slate-500 text-sm">Tonalité : {chant.tonalite}</p>
          </div>
        ))}

        {chantsFiltres.length === 0 && (
          <p className="text-center text-slate-400">Aucun chant trouvé.</p>
        )}
      </div>
    </div>
  );
}

// On exporte le composant pour pouvoir l'utiliser dans App.jsx
export default Bibliotheque;
