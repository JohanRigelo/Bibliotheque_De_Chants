import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { parseContenu } from "../accords";

// useParams : permet de récupérer l'id du chant dans l'URL
// Ex: si l'URL est "/chant/abc123", useParams() donne { id: "abc123" }

function DetailChant() {

  // On récupère l'id du chant depuis l'URL
  const { id } = useParams();
  const navigate = useNavigate();

  // Le chant récupéré depuis Firebase
  const [chant, setChant] = useState(null);

  // Le nombre de demi-tons de transposition (0 = tonalité originale)
  const [transposition, setTransposition] = useState(0);

  // Chargement du chant depuis Firebase au chargement de la page
  useEffect(() => {
    const recupererChant = async () => {
      // doc(db, "chants", id) : on pointe vers UN document précis dans la collection
      const snapshot = await getDoc(doc(db, "chants", id));
      if (snapshot.exists()) {
        setChant({ id: snapshot.id, ...snapshot.data() });
      }
    };
    recupererChant();
  }, [id]);

  // Si le chant n'est pas encore chargé, on affiche un message
  if (!chant) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Chargement...
      </div>
    );
  }

  // On parse le contenu avec la transposition choisie
  const lignes = parseContenu(chant.contenu, transposition);

  // Liste des options de transposition (-6 à +6 demi-tons)
  const optionsTransposition = [
    { valeur: -6, label: "-6" },
    { valeur: -5, label: "-5" },
    { valeur: -4, label: "-4" },
    { valeur: -3, label: "-3" },
    { valeur: -2, label: "-2" },
    { valeur: -1, label: "-1" },
    { valeur: 0, label: "Original" },
    { valeur: 1, label: "+1" },
    { valeur: 2, label: "+2" },
    { valeur: 3, label: "+3" },
    { valeur: 4, label: "+4" },
    { valeur: 5, label: "+5" },
    { valeur: 6, label: "+6" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" }}>

      {/* Bouton retour */}
      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: "20px", padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", color: "#64748b" }}
      >
        ← Retour
      </button>

      {/* En-tête du chant */}
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ color: "#1e40af", fontSize: "2rem", fontWeight: "bold", marginBottom: "4px" }}>
          {chant.titre}
        </h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
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

        {/* Affichage des paroles et accords */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", fontFamily: "monospace" }}>
          {lignes.map((segments, indexLigne) => (
            <div key={indexLigne} style={{ marginBottom: "8px", display: "flex", flexWrap: "wrap" }}>
              {segments.map((segment, indexSegment) => (
                <span key={indexSegment} style={{ display: "inline-flex", flexDirection: "column" }}>
                  {/* Accord au-dessus */}
                  <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "0.85rem", minHeight: "20px" }}>
                    {segment.accord}
                  </span>
                  {/* Texte en dessous */}
                  <span style={{ color: "#1e293b", fontSize: "1rem" }}>
                    {segment.texte || "\u00A0"}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DetailChant;