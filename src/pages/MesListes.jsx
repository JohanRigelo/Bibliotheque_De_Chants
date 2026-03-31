import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
// collection : pointe vers une collection Firebase
// getDocs : récupère tous les documents
// addDoc : ajoute un nouveau document
// deleteDoc : supprime un document
// doc : pointe vers un document précis
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

function MesListes() {

  const navigate = useNavigate();

  // Tableau de toutes les listes récupérées depuis Firebase
  const [listes, setListes] = useState([]);

  // Contrôle l'affichage du formulaire de création d'une nouvelle liste
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);

  // Nom de la nouvelle liste en cours de saisie
  const [nomNouvelleListe, setNomNouvelleListe] = useState("");

  // Liste dont on veut confirmer la suppression (null = aucune)
  const [listeASupprimer, setListeASupprimer] = useState(null);

  // ============================================
  // CHARGEMENT DES LISTES
  // Récupère toutes les listes depuis Firebase
  // ============================================
  const recupererListes = async () => {
    const snapshot = await getDocs(collection(db, "listes"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setListes(data);
  };

  // On charge les listes au démarrage de la page
  useEffect(() => {
    recupererListes();
  }, []);

  // ============================================
  // FONCTION : creerListe
  // Crée une nouvelle liste vide dans Firebase
  // ============================================
  const creerListe = async () => {

    // Vérification que le nom n'est pas vide
    if (!nomNouvelleListe.trim()) {
      alert("Merci de donner un nom à la liste.");
      return;
    }

    try {
      // On crée la liste avec un nom et un tableau de chants vide
      await addDoc(collection(db, "listes"), {
        nom: nomNouvelleListe.trim(),
        chants: [] // tableau vide, on ajoutera les chants depuis la page du chant
      });

      // On recharge les listes pour afficher la nouvelle
      recupererListes();

      // On réinitialise le formulaire
      setNomNouvelleListe("");
      setAfficherFormulaire(false);

    } catch (erreur) {
      console.error("Erreur lors de la création :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  // ============================================
  // FONCTION : supprimerListe
  // Supprime définitivement une liste de Firebase
  // ============================================
  const supprimerListe = async () => {
    try {
      // On supprime le document de la collection "listes"
      await deleteDoc(doc(db, "listes", listeASupprimer.id));

      // On ferme la modale et on recharge les listes
      setListeASupprimer(null);
      recupererListes();

    } catch (erreur) {
      console.error("Erreur lors de la suppression :", erreur);
      alert("Une erreur est survenue, réessaie.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" }}>

      {/* Bouton retour vers la bibliothèque */}
      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: "20px", padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", color: "#64748b" }}
      >
        ← Retour
      </button>

      {/* Titre de la page */}
      <h1 style={{ textAlign: "center", color: "#1e40af", fontSize: "2rem", fontWeight: "bold", marginBottom: "24px" }}>
        📋 Mes Listes
      </h1>

      {/* Bouton pour ouvrir le formulaire de création */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <button
          onClick={() => setAfficherFormulaire(true)}
          style={{ padding: "10px 24px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", fontWeight: "600" }}
        >
          ➕ Nouvelle liste
        </button>
      </div>

      {/* Liste de toutes les setlists */}
      <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

        {listes.map((liste) => (
          <div
            key={liste.id}
            style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            {/* Nom de la liste + nombre de chants — cliquable pour consulter */}
            <div
              onClick={() => navigate(`/liste/${liste.id}`)}
              style={{ cursor: "pointer", flex: 1 }}
            >
              <h2 style={{ color: "#1e293b", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>
                {liste.nom}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                {liste.chants?.length || 0} chant(s)
              </p>
            </div>

            {/* Bouton supprimer cette liste */}
            <button
              onClick={() => setListeASupprimer(liste)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#dc2626", cursor: "pointer", fontWeight: "600" }}
            >
              🗑️
            </button>
          </div>
        ))}

        {/* Message si aucune liste */}
        {listes.length === 0 && (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>
            Aucune liste pour l'instant.
          </p>
        )}
      </div>

      {/* ============================================ */}
      {/* MODALE : Créer une nouvelle liste            */}
      {/* ============================================ */}
      {afficherFormulaire && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>

            <h2 style={{ color: "#1e293b", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "16px", textAlign: "center" }}>
              Nouvelle liste
            </h2>

            {/* Champ nom de la liste */}
            <input
              type="text"
              placeholder="Ex: Réunion du dimanche"
              value={nomNouvelleListe}
              onChange={(e) => setNomNouvelleListe(e.target.value)}
              // onKeyDown : si l'utilisateur appuie sur Entrée, on crée la liste
              onKeyDown={(e) => e.key === "Enter" && creerListe()}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box", marginBottom: "16px" }}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              {/* Annuler */}
              <button
                onClick={() => { setAfficherFormulaire(false); setNomNouvelleListe(""); }}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b" }}
              >
                Annuler
              </button>
              {/* Créer */}
              <button
                onClick={creerListe}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#1e40af", color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: "600" }}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODALE : Confirmer la suppression d'une liste */}
      {/* ============================================ */}
      {listeASupprimer && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", textAlign: "center" }}>

            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>

            <h2 style={{ color: "#1e293b", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>
              Supprimer cette liste ?
            </h2>

            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Es-tu sûr de vouloir supprimer <strong>"{listeASupprimer.nom}"</strong> ?
              Les chants ne seront pas supprimés, seulement la liste.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setListeASupprimer(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "1rem", cursor: "pointer", color: "#64748b", fontWeight: "600" }}
              >
                Annuler
              </button>
              <button
                onClick={supprimerListe}
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

export default MesListes;