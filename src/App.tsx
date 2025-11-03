import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>ご縁クラウド</h1>
            <p>ゴエンクラウドへようこそ</p>
            <p>実装中...</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

