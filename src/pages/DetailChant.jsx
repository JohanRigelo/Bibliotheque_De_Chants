import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
// On ajoute deleteDoc pour pouvoir supprimer un document Firebase
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { parseContenu, extraireMetadonnees } from "../accords";

function DetailChant() {

  const { id } = useParams();
  const navigate = useNavigate();

  // Le chant récupéré depuis Firebase
  const [chant, setChant] = useState(null);

  // Nombre de demi-tons de transposition (0 = tonalité originale)
  const [transposition, setTransposition] = useState(0);

  // Contrôle l'affichage de la modale de confirmation de suppression
  // false = cachée, true = visible
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);

  // Chargement du chant depuis Firebase au chargement de la page
  useEffect(() => {
    const recupererChant = async () => {
      const snapshot = await getDoc(doc(db, "chants", id));
      if (snapshot.exists()) {
        setChant({ id: snapshot.id, ...snapshot.data() });
      }
    };
    recupererChant();
  }, [id]);

  // Tant que le chant n'est pas chargé, on affiche "Chargement..."
  if (!chant) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Chargement...
      </div>
    );
  }

  // On parse le contenu avec la transposition choisie
  const lignes = parseContenu(chant.contenu, transposition);

  // On extrait le titre, sous-titre et commentaires des balises ChordPro
  const meta = extraireMetadonnees(chant.contenu);

  // ============================================
  // FONCTION : supprimerChant
  // Supprime définitivement le chant dans Firebase
  // Appelée uniquement après confirmation dans la modale
  // ============================================
  const supprimerChant = async () => {
    try {
      // deleteDoc supprime le document dont on passe l'id
      await deleteDoc(doc(db, "chants", chant.id));
      // On redirige vers la bibliothèque après suppression
      navigate("/");
    } catch (erreur) {
      console.error("Erreur lors de la suppression :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  // Les 12 notes de la gamme chromatique
  const GAMME = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  // On trouve la position de la tonalité de base dans la gamme
  const indexBase = GAMME.indexOf(chant.tonalite);

  // On génère une option pour chacune des 12 notes
  const optionsTransposition = GAMME.map((note, i) => {
    let demiTons = ((i - indexBase) + 12) % 12;
    if (demiTons > 6) demiTons -= 12;
    return {
      valeur: demiTons,
      label: demiTons === 0 ? `${note} (Original)` : note,
    };
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" }}>

      {/* Boutons Retour, Modifier et Supprimer côte à côte */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>

        {/* Retour : ramène à la bibliothèque */}
        <button
          onClick={() => navigate("/")}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", color: "#64748b" }}
        >
          ← Retour
        </button>

        {/* Modifier : ouvre la page de modification */}
        <button
          onClick={() => navigate(`/modifier/${chant.id}`)}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#1e40af", color: "white", cursor: "pointer", fontWeight: "600" }}
        >
          ✏️ Modifier
        </button>

        {/* Supprimer : ouvre la modale de confirmation */}
        <button
          onClick={() => setAfficherConfirmation(true)}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: "pointer", fontWeight: "600" }}
        >
          🗑️ Supprimer
        </button>

      </div>

      {/* En-tête du chant */}
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* Titre : {t:} s'il existe, sinon le titre Firebase */}
        <h1 style={{ color: "#1e40af", fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "4px" }}>
          {meta.titre || chant.titre}
        </h1>

        {/* Sous-titre {st:} : affiché uniquement s'il existe */}
        {meta.sousTitre && (
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "1rem", marginBottom: "4px" }}>
            {meta.sousTitre}
          </p>
        )}

        {/* Commentaires/copyright {c:} : une ligne par commentaire */}
        {meta.commentaires.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            {meta.commentaires.map((commentaire, index) => (
              <p key={index} style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "2px 0" }}>
                {commentaire}
              </p>
            ))}
          </div>
        )}

        {/* Tonalité de base */}
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" }}>
          Tonalité de base : <strong>{chant.tonalite}</strong>
        </p>

        {/* Menu de transposition */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", backgroundColor: "white", padding: "12px 16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <label style={{ fontWeight: "600", color: "#1e293b" }}>
            🎵 Transposition :
          </label>
          <select
            value={transposition}
            onChange={(e) => setTransposition(Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem" }}
          >
            {optionsTransposition.map((opt) => (
              <option key={opt.valeur} value={opt.valeur}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Affichage des paroles avec accords au-dessus */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", fontFamily: "monospace" }}>
          {lignes.map((segments, indexLigne) => (
            <div key={indexLigne} style={{ marginBottom: "8px", display: "flex", flexWrap: "wrap" }}>
              {segments.map((segment, indexSegment) => (
                <span key={indexSegment} style={{ display: "inline-flex", flexDirection: "column" }}>
                  <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "0.85rem", minHeight: "20px" }}>
                    {segment.accord}
                  </span>
                  <span style={{ color: "#1e293b", fontSize: "1rem" }}>
                    {segment.texte || "\u00A0"}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* MODALE DE CONFIRMATION DE SUPPRESSION        */}
      {/* Visible uniquement si afficherConfirmation = true */}
      {/* ============================================ */}
      {afficherConfirmation && (
        <div style={{
          // Fond semi-transparent qui couvre toute la page
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          {/* Boîte blanche centrale */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            {/* Icône d'avertissement */}
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>

            {/* Titre */}
            <h2 style={{ color: "#1e293b", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>
              Supprimer ce chant ?
            </h2>

            {/* Message avec le nom du chant */}
            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Es-tu sûr de vouloir supprimer <strong>"{chant.titre}"</strong> ?
              Cette action est irréversible.
            </p>

            {/* Boutons */}
            <div style={{ display: "flex", gap: "12px" }}>

              {/* Annuler : ferme la modale sans rien faire */}
              <button
                onClick={() => setAfficherConfirmation(false)}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b", fontWeight: "600" }}
              >
                Annuler
              </button>

              {/* Confirmer : appelle supprimerChant() */}
              <button
                onClick={supprimerChant}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: "600" }}
              >
                Oui, supprimer
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DetailChant;