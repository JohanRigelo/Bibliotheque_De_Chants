import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
// collection : pointe vers une collection Firebase
// getDocs : récupère tous les documents
// addDoc : ajoute un nouveau document
// deleteDoc : supprime un document
// doc : pointe vers un document précis
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import PageLayout from "../components/PageLayout";

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
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    setListes(data);
  };

  // On charge les listes au démarrage de la page
  useEffect(() => {
    const charger = async () => {
      await recupererListes();
    };
    charger();
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
    <PageLayout>

      {/* Bouton retour vers la bibliothèque */}
      <button
        onClick={() => navigate("/")}
        className="mb-5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer text-slate-500 dark:text-slate-400"
      >
        ← Retour
      </button>

      {/* Titre de la page */}
      <h1 className="text-center text-blue-800 dark:text-blue-400 text-3xl font-bold mb-6">
        📋 Mes Listes
      </h1>

      {/* Bouton pour ouvrir le formulaire de création */}
      <div className="text-center mb-6">
        <button
          onClick={() => setAfficherFormulaire(true)}
          className="px-6 py-2.5 bg-blue-800 text-white border-none rounded-lg text-base cursor-pointer font-semibold"
        >
          ➕ Nouvelle liste
        </button>
      </div>

      {/* Liste de toutes les setlists */}
      <div className="max-w-125 mx-auto flex flex-col gap-3">

        {listes.map((liste) => (
          <div
            key={liste.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex justify-between items-center"
          >
            {/* Nom de la liste + nombre de chants — cliquable pour consulter */}
            <div
              onClick={() => navigate(`/liste/${liste.id}`)}
              className="cursor-pointer flex-1"
            >
              <h2 className="text-slate-800 dark:text-slate-100 text-[1.1rem] font-semibold mb-1">
                {liste.nom}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[0.9rem]">
                {liste.chants?.length || 0} chant(s)
              </p>
            </div>

            {/* Bouton supprimer cette liste */}
            <button
              onClick={() => setListeASupprimer(liste)}
              className="px-3 py-2 rounded-lg border-none bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer font-semibold"
            >
              🗑️
            </button>
          </div>
        ))}

        {/* Message si aucune liste */}
        {listes.length === 0 && (
          <p className="text-center text-slate-400">
            Aucune liste pour l'instant.
          </p>
        )}
      </div>

      {/* ============================================ */}
      {/* MODALE : Créer une nouvelle liste            */}
      {/* ============================================ */}
      {afficherFormulaire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-100 w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">

            <h2 className="text-slate-800 dark:text-slate-100 text-[1.3rem] font-bold mb-4 text-center">
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
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-base box-border mb-4 dark:bg-slate-700 dark:text-white"
            />

            <div className="flex gap-3">
              {/* Annuler */}
              <button
                onClick={() => { setAfficherFormulaire(false); setNomNouvelleListe(""); }}
                className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-base cursor-pointer text-slate-500 dark:text-slate-400"
              >
                Annuler
              </button>
              {/* Créer */}
              <button
                onClick={creerListe}
                className="flex-1 p-3 rounded-lg border-none bg-blue-800 text-white text-base cursor-pointer font-semibold"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-100 w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-center">

            <div className="text-5xl mb-4">⚠️</div>

            <h2 className="text-slate-800 dark:text-slate-100 text-[1.3rem] font-bold mb-2">
              Supprimer cette liste ?
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Es-tu sûr de vouloir supprimer <strong>"{listeASupprimer.nom}"</strong> ?
              Les chants ne seront pas supprimés, seulement la liste.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setListeASupprimer(null)}
                className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-base cursor-pointer text-slate-500 dark:text-slate-400 font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={supprimerListe}
                className="flex-1 p-3 rounded-lg border-none bg-red-600 text-white text-base cursor-pointer font-semibold"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
}

export default MesListes;
