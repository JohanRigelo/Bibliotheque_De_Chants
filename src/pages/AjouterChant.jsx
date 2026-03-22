// On importe useState pour gérer les champs du formulaire
import { useState } from "react";

// On importe notre connexion Firebase
import { db } from "../firebase";

// collection : pointe vers une collection Firebase
// addDoc : ajoute un nouveau document dans une collection
import { collection, addDoc } from "firebase/firestore";

// useNavigate : permet de rediriger l'utilisateur vers une autre page
import { useNavigate } from "react-router-dom";

function AjouterChant() {

  // On crée une variable pour chaque champ du formulaire
  // Valeur de départ = texte vide ""
  const [titre, setTitre] = useState("");
  const [tonalite, setTonalite] = useState("C"); // "C" = Do, tonalité par défaut
  const [contenu, setContenu] = useState("");

  // useNavigate nous donne une fonction pour changer de page
  const navigate = useNavigate();

  // Liste de toutes les tonalités disponibles
  const tonalites = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" }}>

      {/* Titre de la page */}
      <h1 style={{ textAlign: "center", color: "#1e40af", fontSize: "2rem", fontWeight: "bold", marginBottom: "24px" }}>
        ➕ Ajouter un chant
      </h1>

      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>

        {/* Champ Titre */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#1e293b" }}>
            Titre du chant
          </label>
          <input
            type="text"
            placeholder="Ex: Amazing Grace"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box" }}
          />
        </div>

        {/* Champ Tonalité */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#1e293b" }}>
            Tonalité de base
          </label>
          {/* select = menu déroulant */}
          {/* onChange met à jour "tonalite" à chaque changement de sélection */}
          <select
            value={tonalite}
            onChange={(e) => setTonalite(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box" }}
          >
            {/* On génère une option pour chaque tonalité de la liste */}
            {tonalites.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Champ Contenu */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#1e293b" }}>
            Paroles et accords
          </label>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "8px" }}>
            Place les accords entre crochets juste avant la syllabe. Ex: [G]Amazing [C]grace
          </p>
          {/* textarea = zone de texte multiligne */}
          <textarea
            placeholder="[G]Amazing [C]grace how [G]sweet the sound..."
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={12}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box", fontFamily: "monospace", resize: "vertical" }}
          />
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: "12px" }}>
          {/* Bouton Annuler : redirige vers la bibliothèque sans sauvegarder */}
          <button
            onClick={() => navigate("/")}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b" }}
          >
            Annuler
          </button>

          {/* Bouton Enregistrer : appelle la fonction sauvegarder() */}
          <button
            onClick={sauvegarder}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#1e40af", color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: "600" }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default AjouterChant;