import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/Mainpage";
import MainPicture from "./components/MainPicture";


function App() {
  return (
    <div className="container">
      <div headerName = "header">
        <Header />
      </div>
      <Footer />
      <MainPage />
      <MainPicture />
    </div>
  );
}

export default App;
