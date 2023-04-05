import "bootstrap/dist/css/bootstrap.min.css";
import './header.css';

const Header = () => {
  return (
    <header>
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
            <div class="col-1" className = 'div-header'>
              <h1 class="logo">RTTM</h1>
            </div>
            <div class="col justify-content-center">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <a href="/" class="nav-link">Home</a>
                </li>
                <li class="nav-item">
                  <a href="/camera-management" class="nav-link">Camera Management</a>
                </li>
                <li class="nav-item">
                  <a href="/historical-data" class="nav-link">Historical Data</a>
                </li>
                <li class="nav-item">
                  <a href="/technologies" class="nav-link">Technologies</a>
                </li>
                <li class="nav-item">
                  <a href="/about-us" class="nav-link">About Us</a>
                </li>
              </ul>
            </div>
            <div class="col-1" className = 'div-header'>
            </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
