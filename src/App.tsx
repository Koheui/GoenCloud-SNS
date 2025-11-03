import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreateSpacePage from './pages/CreateSpacePage';
import SpacePage from './pages/SpacePage';
import CreatePostPage from './pages/CreatePostPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-space" element={<CreateSpacePage />} />
          <Route path="/space/:id" element={<SpacePage />} />
          <Route path="/space/:spaceId/post" element={<CreatePostPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

