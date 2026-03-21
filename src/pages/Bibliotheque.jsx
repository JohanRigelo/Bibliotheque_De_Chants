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
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" }}>

      {/* Titre principal de la page */}
      <h1 style={{ textAlign: "center", color: "#1e40af", fontSize: "2rem", fontWeight: "bold", marginBottom: "24px" }}>
        🎵 Bibliothèque de Chants
      </h1>

      {/* 
        Barre de recherche
        value={recherche} : la valeur affichée est toujours celle de notre variable "recherche"
        onChange : à chaque frappe au clavier, on met à jour "recherche" avec setRecherche
        e.target.value : c'est le texte actuellement dans le champ
      */}
      <input
        type="text"
        placeholder="Rechercher un chant..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto 24px auto",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "1rem"
        }}
      />

      {/* Conteneur de la liste des chants */}
      <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

        {/*
          .map() parcourt chaque chant de la liste filtrée
          et retourne une carte HTML pour chacun
          key={chant.id} : obligatoire en React pour identifier chaque élément de liste
        */}
        {chantsFiltres.map((chant) => (
          <div
            key={chant.id}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer"
            }}
          >
            {/* On affiche le titre et la tonalité de chaque chant */}
            <h2 style={{ color: "#1e293b", fontSize: "1.1rem", fontWeight: "600" }}>{chant.titre}</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Tonalité : {chant.tonalite}</p>
          </div>
        ))}

        {/*
          Message affiché uniquement si aucun chant ne correspond à la recherche
          En JSX, on utilise && pour afficher quelque chose sous condition :
          "si chantsFiltres.length === 0, alors affiche ce paragraphe"
        */}
        {chantsFiltres.length === 0 && (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Aucun chant trouvé.</p>
        )}
      </div>
    </div>
  );
}

// On exporte le composant pour pouvoir l'utiliser dans App.jsx
export default Bibliotheque;