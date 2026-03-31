import { BrowserRouter, Routes, Route } from "react-router-dom";
import Bibliotheque from "./pages/Bibliotheque";
import AjouterChant from "./pages/AjouterChant";
import DetailChant from "./pages/DetailChant";
import ModifierChant from "./pages/ModifierChant";

function App() {
  return (
    // BrowserRouter active la navigation entre les pages
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil = bibliothèque */}
        <Route path="/" element={<Bibliotheque />} />

        {/* Page d'ajout d'un nouveau chant */}
        <Route path="/ajouter" element={<AjouterChant />} />

        {/* Page de détail d'un chant, :id est remplacé par l'id réel */}
        <Route path="/chant/:id" element={<DetailChant />} />

        {/* Page de modification d'un chant existant */}
        <Route path="/modifier/:id" element={<ModifierChant />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;