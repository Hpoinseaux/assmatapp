import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from "./components/AuthForm";
import NounouDashboard from "./components/nounou/NounouDashboard";
import ParentDashboard from "./components/ParentDashboard";
import AuthWrapper from "./components/AuthWrapper"; 
// Import de l'image de fond (à remplacer par votre propre image)
import backgroundImage from './assets/background.jpg';

// Styles pour le fond et le conteneur
const appStyle = {
  minHeight: '100vh',
  background: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${backgroundImage}) fixed center/cover`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  position: 'relative',
};

const contentStyle = {
  width: '100%',
  maxWidth: '1400px',
  backgroundColor: 'rgba(253, 244, 247, 0.98)',  // rose très pâle et doux
  borderRadius: '20px',
  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 1,
  minHeight: '90vh',
  margin: '2rem 0',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(254, 226, 235, 0.7)',  // rose pâle plus doux
  transition: 'all 0.3s ease',
};

// Styles pour les écrans mobiles
const mobileStyles = `
  @media (max-width: 600px) {
    .app-container { padding: 1rem; }
    .content-container { 
      min-height: 95vh;
      margin: 0.5rem;
    }
  }
  .content-container:hover {
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
    transform: translateY(-5px);
  }
`;

function App() {
  return (
    <div style={appStyle} className="app-container">
      <style>{mobileStyles}</style>
      <div style={contentStyle} className="content-container">
        <Router>
          <Routes>
            <Route path="/" element={<AuthForm />} />
            <Route path="/login" element={<AuthWrapper />} />
            <Route path="/nounou" element={<NounouDashboard />} />
            <Route path="/parent/:enfant" element={<ParentDashboard />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
