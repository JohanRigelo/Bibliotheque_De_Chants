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
  const tonalites = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Chargement...
      </div>
    );
  }

  // ============================================
  // AFFICHAGE DU FORMULAIRE
  // Identique au formulaire d'ajout mais avec les champs pré-remplis
  // ============================================
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" }}>

      <h1 style={{ textAlign: "center", color: "#1e40af", fontSize: "2rem", fontWeight: "bold", marginBottom: "24px" }}>
        ✏️ Modifier le chant
      </h1>

      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>

        {/* Champ Titre */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#1e293b" }}>
            Titre du chant
          </label>
          <input
            type="text"
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
          <select
            value={tonalite}
            onChange={(e) => setTonalite(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box" }}
          >
            {/* On génère une option pour chaque tonalité */}
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
          {/* rows={12} : hauteur du textarea en nombre de lignes */}
          {/* resize: "vertical" : l'utilisateur peut agrandir verticalement */}
          {/* fontFamily: "monospace" : police à largeur fixe pour mieux voir les accords */}
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={12}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box", fontFamily: "monospace", resize: "vertical" }}
          />
        </div>

        {/* Boutons Annuler et Enregistrer */}
        <div style={{ display: "flex", gap: "12px" }}>

          {/* Annuler : retourne sur la page du chant sans sauvegarder */}
          <button
            onClick={() => navigate(`/chant/${id}`)}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b" }}
          >
            Annuler
          </button>

          {/* Enregistrer : appelle la fonction sauvegarder() */}
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

export default ModifierChant;