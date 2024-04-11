import "bootstrap/dist/css/bootstrap.min.css";
import "./footer.css";

const Footer = () => {
  return (
    <footer id="sticky-footer" className="flex-shrink-0 py-4 bg-light text-white-50">
      <div className="footer-all">
        <small>
          <a href="/home" className="footer-links">
            Home
          </a>
          <a className="footer-links" href="/camera-management">
            Camera Management
          </a>
          <a className="footer-links" href="/historical-data">
            Historical Data
          </a>
          <a className="footer-links" href="/technologies">
            Technologies
          </a>
          <a className="footer-links" href="/about-us">
            About Us
          </a>
        </small>
      </div>
      <div className="footer-line"></div>
    </footer>
  );
};

export default Footer;