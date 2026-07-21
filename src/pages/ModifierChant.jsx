// ============================================
// IMPORTS
// ============================================

// useState : variables réactives pour les champs du formulaire
// useEffect : pour charger les données du chant au démarrage
import { useState, useEffect } from "react";

// useParams : récupère l'id du chant dans l'URL (/modifier/abc123 → id = "abc123")
// useNavigate : permet de changer de page
import { useParams, useNavigate } from "react-router-dom";

// db : notre connexion à Firebase
import { db } from "../firebase";

// doc : pointe vers un document précis dans Firebase
// getDoc : lit un document
// updateDoc : met à jour un document existant (≠ addDoc qui en crée un nouveau)
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { mettreAJourTagKey } from "../accords";

function ModifierChant() {

  // On récupère l'id du chant depuis l'URL
  const { id } = useParams();
  const navigate = useNavigate();

  // Variables pour chaque champ du formulaire
  // Elles seront pré-remplies avec les valeurs existantes du chant
  const [titre, setTitre] = useState("");
  const [tonalite, setTonalite] = useState("C");
  const [contenu, setContenu] = useState("");

  // Variable pour savoir si on est encore en train de charger les données
  // true au départ, false quand Firebase a répondu
  const [chargement, setChargement] = useState(true);

  // Liste de toutes les tonalités disponibles dans le menu déroulant
  const tonalites = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];

  // ============================================
  // CHARGEMENT DES DONNÉES EXISTANTES
  // Au chargement de la page, on va chercher le chant dans Firebase
  // pour pré-remplir les champs avec ses valeurs actuelles
  // ============================================
  useEffect(() => {
    const recupererChant = async () => {

      // doc(db, "chants", id) : pointe vers le document avec cet id précis
      // getDoc : lit ce document une seule fois
      const snapshot = await getDoc(doc(db, "chants", id));

      if (snapshot.exists()) {
        const data = snapshot.data();

        // On pré-remplit chaque champ avec la valeur existante
        setTitre(data.titre);
        setTonalite(data.tonalite);
        setContenu(data.contenu);
      }

      // On indique que le chargement est terminé
      setChargement(false);
    };

    recupererChant();
  }, [id]); // [id] : se relance si l'id dans l'URL change

  // ============================================
  // FONCTION DE SAUVEGARDE
  // Met à jour le document existant dans Firebase
  // ============================================
  const sauvegarder = async () => {

    // Vérification que les champs obligatoires sont remplis
    if (!titre.trim() || !contenu.trim()) {
      alert("Merci de remplir le titre et le contenu du chant.");
      return;
    }

    try {
      // updateDoc : met à jour le document existant sans le recréer
      // Seuls les champs qu'on passe ici seront modifiés
      await updateDoc(doc(db, "chants", id), {
        titre: titre.trim(),
        tonalite: tonalite,
        contenu: contenu.trim(),
      });

      // Après sauvegarde, on retourne sur la page du chant
      navigate(`/chant/${id}`);

    } catch (erreur) {
      console.error("Erreur lors de la modification :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  // ============================================
  // AFFICHAGE DE CHARGEMENT
  // Tant que Firebase n'a pas répondu, on affiche "Chargement..."
  // ============================================
  if (chargement) {
    return (
      <div className="text-center p-10 text-slate-500 dark:text-slate-400">
        Chargement...
      </div>
    );
  }

  // ============================================
  // AFFICHAGE DU FORMULAIRE
  // Identique au formulaire d'ajout mais avec les champs pré-remplis
  // ============================================
  return (
    <div className="min-h-screen bg-[#f0f4ff] dark:bg-slate-900 p-5">

      <h1 className="text-center text-blue-800 dark:text-blue-400 text-3xl font-bold mb-6">
        ✏️ Modifier le chant
      </h1>

      <div className="max-w-150 mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.1)]">

        {/* Champ Titre */}
        <div className="mb-4">
          <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-100">
            Titre du chant
          </label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-base box-border dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Champ Tonalité */}
        <div className="mb-4">
          <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-100">
            Tonalité de base
          </label>
          <select
            value={tonalite}
            onChange={(e) => {
              const nouvelleTonalite = e.target.value;
              setTonalite(nouvelleTonalite);
              // On met à jour automatiquement la balise {key:...} dans le contenu
              setContenu((contenuActuel) => mettreAJourTagKey(contenuActuel, nouvelleTonalite));
            }}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-base box-border dark:bg-slate-700 dark:text-white"
          >
            {/* On génère une option pour chaque tonalité */}
            {tonalites.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Champ Contenu */}
        <div className="mb-6">
          <label className="block font-semibold mb-1.5 text-slate-800 dark:text-slate-100">
            Paroles et accords
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Place les accords entre crochets juste avant la syllabe. Ex: [G]Amazing [C]grace
          </p>
          {/* rows={12} : hauteur du textarea en nombre de lignes */}
          {/* resize-y : l'utilisateur peut agrandir verticalement */}
          {/* font-mono : police à largeur fixe pour mieux voir les accords */}
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={12}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-base box-border font-mono resize-y dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Boutons Annuler et Enregistrer */}
        <div className="flex gap-3">

          {/* Annuler : retourne sur la page du chant sans sauvegarder */}
          <button
            onClick={() => navigate(`/chant/${id}`)}
            className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-base cursor-pointer text-slate-500 dark:text-slate-400"
          >
            Annuler
          </button>

          {/* Enregistrer : appelle la fonction sauvegarder() */}
          <button
            onClick={sauvegarder}
            className="flex-1 p-3 rounded-lg border-none bg-blue-800 text-white text-base cursor-pointer font-semibold"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifierChant;
