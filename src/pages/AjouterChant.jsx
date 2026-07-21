// On importe useState pour gérer les champs du formulaire
import { useState } from "react";

// On importe notre connexion Firebase
import { db } from "../firebase";

// collection : pointe vers une collection Firebase
// addDoc : ajoute un nouveau document dans une collection
import { collection, addDoc } from "firebase/firestore";

// useNavigate : permet de rediriger l'utilisateur vers une autre page
import { useNavigate } from "react-router-dom";
import { mettreAJourTagKey } from "../accords";

function AjouterChant() {

  // On crée une variable pour chaque champ du formulaire
  // Valeur de départ = texte vide ""
  const [titre, setTitre] = useState("");
  const [tonalite, setTonalite] = useState("C"); // "C" = Do, tonalité par défaut
  const [contenu, setContenu] = useState("");

  // useNavigate nous donne une fonction pour changer de page
  const navigate = useNavigate();

  // Liste de toutes les tonalités disponibles
  const tonalites = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
    "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"
  ];

  // ============================================
  // FONCTION DE SAUVEGARDE
  // S'exécute quand l'utilisateur clique sur "Enregistrer"
  // ============================================
  const sauvegarder = async () => {

    // On vérifie que les champs obligatoires ne sont pas vides
    // .trim() supprime les espaces au début et à la fin
    if (!titre.trim() || !contenu.trim()) {
      alert("Merci de remplir le titre et le contenu du chant.");
      return; // On arrête la fonction ici si les champs sont vides
    }

    try {
      // addDoc ajoute un nouveau document dans la collection "chants"
      // On lui passe un objet avec les données du chant
      await addDoc(collection(db, "chants"), {
        titre: titre.trim(),
        tonalite: tonalite,
        contenu: contenu.trim(),
      });

      // Une fois sauvegardé, on redirige vers la bibliothèque
      navigate("/");

    } catch (erreur) {
      console.error("Erreur lors de la sauvegarde :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-5">

      {/* Titre de la page */}
      <h1 className="text-center text-blue-800 text-3xl font-bold mb-6">
        ➕ Ajouter un chant
      </h1>

      <div className="max-w-[600px] mx-auto bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.1)]">

        {/* Champ Titre */}
        <div className="mb-4">
          <label className="block font-semibold mb-1.5 text-slate-800">
            Titre du chant
          </label>
          <input
            type="text"
            placeholder="Ex: Amazing Grace"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-base box-border"
          />
        </div>

        {/* Champ Tonalité */}
        <div className="mb-4">
          <label className="block font-semibold mb-1.5 text-slate-800">
            Tonalité de base
          </label>
          {/* select = menu déroulant */}
          {/* onChange met à jour "tonalite" à chaque changement de sélection */}
          <select
            value={tonalite}
            onChange={(e) => {
              const nouvelleTonalite = e.target.value;
              setTonalite(nouvelleTonalite);
              // On met à jour automatiquement la balise {key:...} dans le contenu
              setContenu((contenuActuel) => mettreAJourTagKey(contenuActuel, nouvelleTonalite));
            }}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-base box-border"
          >
            {/* On génère une option pour chaque tonalité de la liste */}
            {tonalites.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Champ Contenu */}
        <div className="mb-6">
          <label className="block font-semibold mb-1.5 text-slate-800">
            Paroles et accords
          </label>
          <p className="text-sm text-slate-500 mb-2">
            Place les accords entre crochets juste avant la syllabe. Ex: [G]Amazing [C]grace
          </p>
          {/* textarea = zone de texte multiligne */}
          <textarea
            placeholder="[G]Amazing [C]grace how [G]sweet the sound..."
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={12}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-base box-border font-mono resize-y"
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          {/* Bouton Annuler : redirige vers la bibliothèque sans sauvegarder */}
          <button
            onClick={() => navigate("/")}
            className="flex-1 p-3 rounded-lg border border-slate-300 bg-white text-base cursor-pointer text-slate-500"
          >
            Annuler
          </button>

          {/* Bouton Enregistrer : appelle la fonction sauvegarder() */}
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

export default AjouterChant;
