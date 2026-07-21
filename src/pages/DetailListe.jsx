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
      <div className="text-center p-10 text-slate-500 dark:text-slate-400">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] dark:bg-slate-900 p-5">

      {/* Bouton retour vers Mes Listes */}
      <button
        onClick={() => navigate("/listes")}
        className="mb-5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer text-slate-500 dark:text-slate-400"
      >
        ← Retour
      </button>

      {/* Titre de la liste */}
      <h1 className="text-center text-blue-800 dark:text-blue-400 text-3xl font-bold mb-2">
        📋 {liste.nom}
      </h1>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
        {chants.length} chant(s)
      </p>

      {/* Liste des chants */}
      <div className="max-w-125 mx-auto flex flex-col gap-3">

        {chants.map((chant, index) => (
          <div
            key={chant.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex justify-between items-center"
          >
            {/* Titre et tonalité — cliquable pour ouvrir le chant */}
            {/* On passe l'id de la liste ET la position du chant dans l'URL */}
            <div
              onClick={() => navigate(`/chant/${chant.id}?listeId=${liste.id}&index=${index}`)}
              className="cursor-pointer flex-1"
            >
              <h2 className="text-slate-800 dark:text-slate-100 text-[1.1rem] font-semibold mb-1">
                {chant.titre}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[0.9rem]">
                Tonalité : {chant.tonalite}
              </p>
            </div>

            {/* Bouton retirer de la liste */}
            <button
              onClick={() => setChantARetirer(chant)}
              className="px-3 py-2 rounded-lg border-none bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer font-semibold"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Message si la liste est vide */}
        {chants.length === 0 && (
          <p className="text-center text-slate-400">
            Aucun chant dans cette liste.<br />
            Ajoute des chants depuis la page d'un chant !
          </p>
        )}
      </div>

      {/* ============================================ */}
      {/* MODALE : Confirmer le retrait d'un chant     */}
      {/* ============================================ */}
      {chantARetirer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-100 w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-center">

            <div className="text-5xl mb-4">⚠️</div>

            <h2 className="text-slate-800 dark:text-slate-100 text-[1.3rem] font-bold mb-2">
              Retirer ce chant ?
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Retirer <strong>"{chantARetirer.titre}"</strong> de la liste <strong>"{liste.nom}"</strong> ?
              Le chant restera dans la bibliothèque.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setChantARetirer(null)}
                className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-base cursor-pointer text-slate-500 dark:text-slate-400 font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={retirerChant}
                className="flex-1 p-3 rounded-lg border-none bg-red-600 text-white text-base cursor-pointer font-semibold"
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
