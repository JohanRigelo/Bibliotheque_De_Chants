import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { parseContenu, extraireMetadonnees } from "../accords";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageLayout from "../components/PageLayout";


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
      <div className="text-center p-10 text-slate-500 dark:text-slate-400">
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

// On détermine si le chant est en tonalité mineure (ex: "Am") ou majeure (ex: "C")
const estMineur = chant.tonalite?.endsWith("m") || false;

// On isole la note de base, sans le "m" éventuel
// Ex: "Am" → "A", "C#m" → "C#", "G" → "G"
const noteBase = estMineur ? chant.tonalite.slice(0, -1) : (chant.tonalite || "C");

// On trouve la position de la note de base dans la gamme
const indexBase = GAMME.indexOf(noteBase);

// On génère 12 options, toutes de la même qualité que le chant d'origine
// (uniquement des tonalités majeures si le chant est en majeur,
//  uniquement des tonalités mineures s'il est en mineur)
const optionsTransposition = GAMME.map((note, i) => {
  // Calcul du nombre de demi-tons entre la tonalité de base et cette note
  let demiTons = ((i - indexBase) + 12) % 12;
  if (demiTons > 6) demiTons -= 12;

  // On ajoute le "m" au label si le chant d'origine est en mineur
  const label = estMineur ? `${note}m` : note;

  return {
    valeur: demiTons,
    label: demiTons === 0 ? `${label} (Original)` : label,
  };
});

  return (
    <PageLayout>

      <div className="flex gap-3 mb-5 flex-wrap">

        <button
          onClick={() => {
            if (listeId) {
              navigate(`/liste/${listeId}`);
            } else {
              navigate("/");
            }
          }}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer text-slate-500 dark:text-slate-400"
        >
          ← Retour
        </button>

        {listeId && (
          <>
            <button
              onClick={() => navigate(`/chant/${chantsListe[indexCourant - 1]}?listeId=${listeId}&index=${indexCourant - 1}`)}
              disabled={indexCourant <= 0}
              className={`px-4 py-2 rounded-lg border-none font-semibold ${indexCourant <= 0 ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default" : "bg-indigo-500 text-white cursor-pointer"}`}
            >
              ◀ Précédent
            </button>

            <span className="p-2 text-slate-500 dark:text-slate-400 text-[0.9rem] self-center">
              {indexCourant + 1} / {chantsListe.length}
            </span>

            <button
              onClick={() => navigate(`/chant/${chantsListe[indexCourant + 1]}?listeId=${listeId}&index=${indexCourant + 1}`)}
              disabled={indexCourant >= chantsListe.length - 1}
              className={`px-4 py-2 rounded-lg border-none font-semibold ${indexCourant >= chantsListe.length - 1 ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default" : "bg-indigo-500 text-white cursor-pointer"}`}
            >
              Suivant ▶
            </button>
          </>
        )}

        <button
          onClick={() => navigate(`/modifier/${chant.id}`)}
          className="px-4 py-2 rounded-lg border-none bg-blue-800 text-white cursor-pointer font-semibold"
        >
          ✏️ Modifier
        </button>

        <button
          onClick={() => setAfficherConfirmation(true)}
          className="px-4 py-2 rounded-lg border-none bg-red-600 text-white cursor-pointer font-semibold"
        >
          🗑️ Supprimer
        </button>

        <button
          onClick={() => { setAfficherModaleListe(true); chargerListes(); }}
          className="px-4 py-2 rounded-lg border-none bg-emerald-600 text-white cursor-pointer font-semibold"
        >
          📋 Ajouter à une liste
        </button>

      </div>
      {/* En-tête du chant */}
      <div className="max-w-175 mx-auto">

        {/* Titre : {t:} s'il existe, sinon le titre Firebase */}
        <h1 className="text-blue-800 dark:text-blue-400 text-[2rem] font-bold text-center mb-1">
          {meta.titre || chant.titre}
        </h1>

        {/* Sous-titre {st:} : affiché uniquement s'il existe */}
        {meta.sousTitre && (
          <p className="text-center text-slate-500 dark:text-slate-400 text-base mb-1">
            {meta.sousTitre}
          </p>
        )}

        {/* Commentaires/copyright {c:} : une ligne par commentaire */}
        {meta.commentaires.length > 0 && (
          <div className="text-center mb-2">
            {meta.commentaires.map((commentaire, index) => (
              <p key={index} className="text-slate-400 dark:text-slate-500 text-[0.8rem] my-0.5">
                {commentaire}
              </p>
            ))}
          </div>
        )}

        {/* Tonalité de base */}
        <p className="text-center text-slate-400 dark:text-slate-500 text-[0.9rem] mb-5">
          Tonalité de base : <strong>{chant.tonalite}</strong>
        </p>

        {/* Menu de transposition */}
        <div className="flex items-center gap-3 mb-6 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <label className="font-semibold text-slate-800 dark:text-slate-100">
            🎵 Transposition :
          </label>
         <select
            value={transposition}
            onChange={(e) => setTransposition(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-base dark:bg-slate-700 dark:text-white"
          >
            {optionsTransposition.map((opt) => (
              <option key={opt.valeur} value={opt.valeur}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Affichage des paroles avec accords au-dessus */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.1)] font-mono">
          {lignes.map((segments, indexLigne) => (
            <div key={indexLigne} className="mb-2 flex flex-wrap">
              {segments.map((segment, indexSegment) => (
                <span key={indexSegment} className="inline-flex flex-col">
                  <span className="text-blue-800 dark:text-blue-400 font-bold text-[0.85rem] min-h-5">
                    {segment.accord}
                  </span>
                  <span className="text-slate-800 dark:text-slate-100 text-base">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-100 w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">

            <h2 className="text-slate-800 dark:text-slate-100 text-[1.3rem] font-bold mb-4 text-center">
              📋 Ajouter à une liste
            </h2>

            {/* Listes existantes */}
            {listes.length > 0 && (
              <div className="mb-4">
                <p className="text-slate-500 dark:text-slate-400 text-[0.9rem] mb-2 font-semibold">
                  Listes existantes :
                </p>
                <div className="flex flex-col gap-2">
                  {listes.map((liste) => (
                    <button
                      key={liste.id}
                      onClick={() => ajouterAListe(liste)}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 cursor-pointer text-left text-base text-slate-800 dark:text-slate-100"
                    >
                      {liste.nom}
                      <span className="text-slate-400 dark:text-slate-500 text-[0.85rem] ml-2">
                        ({liste.chants?.length || 0} chant(s))
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Séparateur */}
            <div className="border-t border-slate-200 dark:border-slate-600 my-4" />

            {/* Créer une nouvelle liste */}
            <p className="text-slate-500 dark:text-slate-400 text-[0.9rem] mb-2 font-semibold">
              Ou créer une nouvelle liste :
            </p>
            <input
              type="text"
              placeholder="Nom de la nouvelle liste..."
              value={nomNouvelleListe}
              onChange={(e) => setNomNouvelleListe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && creerListeEtAjouter()}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-base box-border mb-3 dark:bg-slate-700 dark:text-white"
            />
            <button
              onClick={creerListeEtAjouter}
              className="w-full p-2.5 rounded-lg border-none bg-blue-800 text-white text-base cursor-pointer font-semibold mb-3"
            >
              Créer et ajouter
            </button>

            {/* Fermer la modale */}
            <button
              onClick={() => { setAfficherModaleListe(false); setNomNouvelleListe(""); }}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-base cursor-pointer text-slate-500 dark:text-slate-400"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-100 w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-center">

            <div className="text-5xl mb-4">⚠️</div>

            <h2 className="text-slate-800 dark:text-slate-100 text-[1.3rem] font-bold mb-2">
              Supprimer ce chant ?
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Es-tu sûr de vouloir supprimer <strong>"{chant.titre}"</strong> ?
              Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setAfficherConfirmation(false)}
                className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-base cursor-pointer text-slate-500 dark:text-slate-400 font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={supprimerChant}
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

export default DetailChant;