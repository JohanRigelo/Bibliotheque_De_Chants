import { useState, useEffect } from "react";

// ============================================
// COMPOSANT : ThemeToggle
// Bouton flottant (🌙 / ☀️) pour basculer entre mode clair et mode nuit.
// Le choix est sauvegardé dans le navigateur (localStorage), donc il
// est mémorisé même après avoir fermé et rouvert l'appli.
// ============================================
function ThemeToggle() {

  const [sombre, setSombre] = useState(() => {
    // On vérifie d'abord si l'utilisateur a déjà choisi un thème manuellement
    const themeSauvegarde = localStorage.getItem("theme");
    if (themeSauvegarde) return themeSauvegarde === "dark";
    // Sinon, on suit la préférence du système (mode nuit de l'OS/navigateur)
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // À chaque changement, on ajoute/retire la classe "dark" sur <html>
  // (c'est cette classe que Tailwind utilise pour activer les styles dark:)
  // et on sauvegarde le choix pour la prochaine visite
  useEffect(() => {
    document.documentElement.classList.toggle("dark", sombre);
    localStorage.setItem("theme", sombre ? "dark" : "light");
  }, [sombre]);

  return (
    <button
      onClick={() => setSombre(!sombre)}
      title={sombre ? "Passer en mode clair" : "Passer en mode nuit"}
      className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full bg-white dark:bg-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl cursor-pointer border border-slate-200 dark:border-slate-600"
    >
      {sombre ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeToggle;
