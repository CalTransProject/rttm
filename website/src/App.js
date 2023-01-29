import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/Mainpage";
import MainPicture from "./components/MainPicture";
import { BrowserRouter as Router, Route, Routes, Switch } from 'react-router-dom';



function App() {
  return (
    <Router>
        <div className="App">
          <div className = "content">
            <Header />
          </div>
          <div className="container-fluid">
            <Routes>
              <Route path="/" element={
                <MainPage />} />
            </Routes>
          </div>
          <div className="footer">
            <Footer />
          </div>
        </div>
      
    </Router>
  );
}

export default App;
