import { HashRouter as Router, Routes, Route } from "react-router-dom";
import BarcodeGenerator from "./pages/BarcodeGenerator";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BarcodeGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
