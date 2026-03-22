// BrowserRouter : englobe toute l'app pour activer la navigation
// Routes : contient toutes les routes de l'app
// Route : définit quelle page afficher selon l'URL
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Bibliotheque from "./pages/Bibliotheque";
import AjouterChant from "./pages/AjouterChant";

function App() {
  return (
    // BrowserRouter active le système de navigation
    <BrowserRouter>
      <Routes>
        {/* "/" = page d'accueil = la bibliothèque */}
        <Route path="/" element={<Bibliotheque />} />

        {/* "/ajouter" = page pour ajouter un chant */}
        <Route path="/ajouter" element={<AjouterChant />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;