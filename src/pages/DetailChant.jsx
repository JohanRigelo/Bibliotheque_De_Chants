import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { parseContenu, extraireMetadonnees } from "../accords";
import { useParams, useNavigate, useLocation } from "react-router-dom";

function DetailChant() {

  const { id } = useParams();
  const navigate = useNavigate();
  // useLocation permet de lire l'URL complète et ses paramètres
const location = useLocation();

// URLSearchParams parse les query params de l'URL
// Ex: ?listeId=xyz&index=2
const params = new URLSearchParams(location.search);
const listeId = params.get("listeId");   // id de la liste d'où on vient (null si pas de liste)
const indexCourant = parseInt(params.get("index") ?? "-1"); // position dans la liste (-1 si pas de liste)

// Tableau des ids des chants de la liste pour naviguer entre eux
const [chantsListe, setChantsListe] = useState([]);

// Si on vient d'une liste, on charge ses chants
useEffect(() => {
  const chargerChantsListe = async () => {
    if (!listeId) return; // Si pas de listeId dans l'URL, on ne fait rien
    const snapshotListe = await getDoc(doc(db, "listes", listeId));
    if (snapshotListe.exists()) {
      // On stocke juste le tableau d'ids des chants
      setChantsListe(snapshotListe.data().chants || []);
    }
  };
  chargerChantsListe();
}, [listeId]);

  // Le chant récupéré depuis Firebase
  const [chant, setChant] = useState(null);

  // Nombre de demi-tons de transposition (0 = tonalité originale)
  const [transposition, setTransposition] = useState(0);

  // Contrôle l'affichage de la modale de confirmation de suppression
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);

  // Contrôle l'affichage de la modale d'ajout à une liste
  const [afficherModaleListe, setAfficherModaleListe] = useState(false);

  // Toutes les listes disponibles récupérées depuis Firebase
  const [listes, setListes] = useState([]);

  // Nom d'une nouvelle liste si l'utilisateur veut en créer une
  const [nomNouvelleListe, setNomNouvelleListe] = useState("");

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
  // ============================================
  const supprimerChant = async () => {
    try {
      await deleteDoc(doc(db, "chants", chant.id));
      navigate("/");
    } catch (erreur) {
      console.error("Erreur lors de la suppression :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  // ============================================
  // FONCTION : chargerListes
  // Récupère toutes les listes depuis Firebase
  // Appelée quand on ouvre la modale d'ajout
  // ============================================
  const chargerListes = async () => {
    const snapshot = await getDocs(collection(db, "listes"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    setListes(data);
  };

  // ============================================
  // FONCTION : ajouterAListe
  // Ajoute l'id du chant courant dans une liste existante
  // ============================================
  const ajouterAListe = async (liste) => {
    try {
      // On vérifie que le chant n'est pas déjà dans la liste
      if (liste.chants?.includes(chant.id)) {
        alert("Ce chant est déjà dans cette liste !");
        return;
      }
      // On ajoute l'id du chant au tableau existant
      // "..." = on copie les ids existants et on ajoute le nouveau
      const nouveauxChants = [...(liste.chants || []), chant.id];
      await updateDoc(doc(db, "listes", liste.id), {
        chants: nouveauxChants
      });
      alert(`"${chant.titre}" ajouté à "${liste.nom}" !`);
      setAfficherModaleListe(false);
    } catch (erreur) {
      console.error("Erreur lors de l'ajout :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  // ============================================
  // FONCTION : creerListeEtAjouter
  // Crée une nouvelle liste et y ajoute directement le chant
  // ============================================
  const creerListeEtAjouter = async () => {
    if (!nomNouvelleListe.trim()) {
      alert("Merci de donner un nom à la liste.");
      return;
    }
    try {
      // On crée la nouvelle liste avec le chant déjà dedans
      await addDoc(collection(db, "listes"), {
        nom: nomNouvelleListe.trim(),
        chants: [chant.id]
      });
      alert(`Liste "${nomNouvelleListe}" créée et "${chant.titre}" ajouté !`);
      setNomNouvelleListe("");
      setAfficherModaleListe(false);
    } catch (erreur) {
      console.error("Erreur lors de la création :", erreur);
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

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>

        <button
          onClick={() => {
            if (listeId) {
              navigate(`/liste/${listeId}`);
            } else {
              navigate("/");
            }
          }}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", color: "#64748b" }}
        >
          ← Retour
        </button>

        {listeId && (
          <>
            <button
              onClick={() => navigate(`/chant/${chantsListe[indexCourant - 1]}?listeId=${listeId}&index=${indexCourant - 1}`)}
              disabled={indexCourant <= 0}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: indexCourant <= 0 ? "#e2e8f0" : "#6366f1", color: indexCourant <= 0 ? "#94a3b8" : "white", cursor: indexCourant <= 0 ? "default" : "pointer", fontWeight: "600" }}
            >
              ◀ Précédent
            </button>

            <span style={{ padding: "8px", color: "#64748b", fontSize: "0.9rem", alignSelf: "center" }}>
              {indexCourant + 1} / {chantsListe.length}
            </span>

            <button
              onClick={() => navigate(`/chant/${chantsListe[indexCourant + 1]}?listeId=${listeId}&index=${indexCourant + 1}`)}
              disabled={indexCourant >= chantsListe.length - 1}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: indexCourant >= chantsListe.length - 1 ? "#e2e8f0" : "#6366f1", color: indexCourant >= chantsListe.length - 1 ? "#94a3b8" : "white", cursor: indexCourant >= chantsListe.length - 1 ? "default" : "pointer", fontWeight: "600" }}
            >
              Suivant ▶
            </button>
          </>
        )}

        <button
          onClick={() => navigate(`/modifier/${chant.id}`)}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#1e40af", color: "white", cursor: "pointer", fontWeight: "600" }}
        >
          ✏️ Modifier
        </button>

        <button
          onClick={() => setAfficherConfirmation(true)}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: "pointer", fontWeight: "600" }}
        >
          🗑️ Supprimer
        </button>

        <button
          onClick={() => { setAfficherModaleListe(true); chargerListes(); }}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#059669", color: "white", cursor: "pointer", fontWeight: "600" }}
        >
          📋 Ajouter à une liste
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
      {/* MODALE : Ajouter le chant à une liste        */}
      {/* ============================================ */}
      {afficherModaleListe && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>

            <h2 style={{ color: "#1e293b", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "16px", textAlign: "center" }}>
              📋 Ajouter à une liste
            </h2>

            {/* Listes existantes */}
            {listes.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "8px", fontWeight: "600" }}>
                  Listes existantes :
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {listes.map((liste) => (
                    <button
                      key={liste.id}
                      onClick={() => ajouterAListe(liste)}
                      style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", cursor: "pointer", textAlign: "left", fontSize: "1rem", color: "#1e293b" }}
                    >
                      {liste.nom}
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem", marginLeft: "8px" }}>
                        ({liste.chants?.length || 0} chant(s))
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Séparateur */}
            <div style={{ borderTop: "1px solid #e2e8f0", margin: "16px 0" }} />

            {/* Créer une nouvelle liste */}
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "8px", fontWeight: "600" }}>
              Ou créer une nouvelle liste :
            </p>
            <input
              type="text"
              placeholder="Nom de la nouvelle liste..."
              value={nomNouvelleListe}
              onChange={(e) => setNomNouvelleListe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && creerListeEtAjouter()}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box", marginBottom: "12px" }}
            />
            <button
              onClick={creerListeEtAjouter}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#1e40af", color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: "600", marginBottom: "12px" }}
            >
              Créer et ajouter
            </button>

            {/* Fermer la modale */}
            <button
              onClick={() => { setAfficherModaleListe(false); setNomNouvelleListe(""); }}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b" }}
            >
              Annuler
            </button>

          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODALE DE CONFIRMATION DE SUPPRESSION        */}
      {/* ============================================ */}
      {afficherConfirmation && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", textAlign: "center" }}>

            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>

            <h2 style={{ color: "#1e293b", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>
              Supprimer ce chant ?
            </h2>

            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Es-tu sûr de vouloir supprimer <strong>"{chant.titre}"</strong> ?
              Cette action est irréversible.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setAfficherConfirmation(false)}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b", fontWeight: "600" }}
              >
                Annuler
              </button>
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