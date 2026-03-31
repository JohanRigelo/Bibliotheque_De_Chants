import { BrowserRouter, Routes, Route } from "react-router-dom";
import Bibliotheque from "./pages/Bibliotheque";
import AjouterChant from "./pages/AjouterChant";
import DetailChant from "./pages/DetailChant";
import ModifierChant from "./pages/ModifierChant";
import MesListes from "./pages/MesListes";
import DetailListe from "./pages/DetailListe";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bibliotheque />} />
        <Route path="/ajouter" element={<AjouterChant />} />
        <Route path="/chant/:id" element={<DetailChant />} />
        <Route path="/modifier/:id" element={<ModifierChant />} />
        <Route path="/listes" element={<MesListes />} />
        {/* :id = l'id de la liste à consulter */}
        <Route path="/liste/:id" element={<DetailListe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;