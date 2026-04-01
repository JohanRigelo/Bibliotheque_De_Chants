import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
// doc : pointe vers un document précis
// getDoc : lit un document
// updateDoc : met à jour un document existant
import { doc, getDoc, updateDoc } from "firebase/firestore";

function DetailListe() {

  const { id } = useParams();
  const navigate = useNavigate();

  // La liste récupérée depuis Firebase
  const [liste, setListe] = useState(null);

  // Les chants complets correspondant aux ids stockés dans la liste
  const [chants, setChants] = useState([]);

  // Id du chant dont on veut confirmer le retrait de la liste
  const [chantARetirer, setChantARetirer] = useState(null);

  // ============================================
  // CHARGEMENT DE LA LISTE ET DE SES CHANTS
  // On charge la liste puis on charge chaque chant
  // dont l'id est stocké dans liste.chants
  // ============================================
  useEffect(() => {
    const recupererListe = async () => {

      // On récupère le document de la liste
      const snapshotListe = await getDoc(doc(db, "listes", id));
      if (!snapshotListe.exists()) return;

      const listeData = { id: snapshotListe.id, ...snapshotListe.data() };
      setListe(listeData);

      // Pour chaque id de chant dans la liste, on va chercher le chant complet
      // Promise.all attend que TOUTES les promesses soient résolues avant de continuer
      // C'est plus rapide que d'attendre chaque chant un par un
      const chantsData = await Promise.all(
        (listeData.chants || []).map(async (chantId) => {
          const snapshotChant = await getDoc(doc(db, "chants", chantId));
          if (snapshotChant.exists()) {
            return { id: snapshotChant.id, ...snapshotChant.data() };
          }
          // Si le chant n'existe plus dans la bdd, on retourne null
          return null;
        })
      );

      // On filtre les null (chants supprimés entre temps)
      setChants(chantsData.filter((c) => c !== null));
    };

    recupererListe();
  }, [id]);

  // ============================================
  // FONCTION : retirerChant
  // Retire un chant de la liste sans le supprimer de la bibliothèque
  // ============================================
  const retirerChant = async () => {
    try {
      // On filtre le tableau en retirant l'id du chant concerné
      const nouveauxChants = liste.chants.filter((cid) => cid !== chantARetirer.id);

      // On met à jour le document de la liste dans Firebase
      await updateDoc(doc(db, "listes", liste.id), {
        chants: nouveauxChants
      });

      // On met à jour l'affichage localement sans recharger depuis Firebase
      setListe({ ...liste, chants: nouveauxChants });
      setChants(chants.filter((c) => c.id !== chantARetirer.id));
      setChantARetirer(null);

    } catch (erreur) {
      console.error("Erreur lors du retrait :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  // Tant que la liste n'est pas chargée
  if (!liste) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" }}>

      {/* Bouton retour vers Mes Listes */}
      <button
        onClick={() => navigate("/listes")}
        style={{ marginBottom: "20px", padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", color: "#64748b" }}
      >
        ← Retour
      </button>

      {/* Titre de la liste */}
      <h1 style={{ textAlign: "center", color: "#1e40af", fontSize: "2rem", fontWeight: "bold", marginBottom: "8px" }}>
        📋 {liste.nom}
      </h1>
      <p style={{ textAlign: "center", color: "#64748b", marginBottom: "24px" }}>
        {chants.length} chant(s)
      </p>

      {/* Liste des chants */}
      <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

        {chants.map((chant, index) => (
          <div
             key={chant.id}
              style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
            {/* Titre et tonalité — cliquable pour ouvrir le chant */}
            {/* On passe l'id de la liste ET la position du chant dans l'URL */}
          <div
            onClick={() => navigate(`/chant/${chant.id}?listeId=${liste.id}&index=${index}`)}
            style={{ cursor: "pointer", flex: 1 }}
          >
              <h2 style={{ color: "#1e293b", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>
                {chant.titre}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                Tonalité : {chant.tonalite}
              </p>
            </div>

            {/* Bouton retirer de la liste */}
            <button
              onClick={() => setChantARetirer(chant)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#dc2626", cursor: "pointer", fontWeight: "600" }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Message si la liste est vide */}
        {chants.length === 0 && (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>
            Aucun chant dans cette liste.<br />
            Ajoute des chants depuis la page d'un chant !
          </p>
        )}
      </div>

      {/* ============================================ */}
      {/* MODALE : Confirmer le retrait d'un chant     */}
      {/* ============================================ */}
      {chantARetirer && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", textAlign: "center" }}>

            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>

            <h2 style={{ color: "#1e293b", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>
              Retirer ce chant ?
            </h2>

            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Retirer <strong>"{chantARetirer.titre}"</strong> de la liste <strong>"{liste.nom}"</strong> ?
              Le chant restera dans la bibliothèque.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setChantARetirer(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b", fontWeight: "600" }}
              >
                Annuler
              </button>
              <button
                onClick={retirerChant}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: "600" }}
              >
                Oui, retirer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DetailListe;