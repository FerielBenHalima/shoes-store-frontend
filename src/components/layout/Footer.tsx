import './Footer.css'
import { FiFacebook, FiInstagram, FiPhone, FiMapPin, FiMail } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer id='footer' className="footer">
      <div className="footer-inner container">

        {/* ── Brand column ─────────────────────────── */}
        <div className="footer-brand">
          <h2 className="footer-logo">Mansour<span>.</span></h2>
          <h4 className="footer-tagline">
            La chaussure de qualité, livrée chez vous en Tunisie.
          </h4>

       

          <div className="footer-socials">
            
            <a href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="Facebook"
            >
              <FiFacebook size={16} />
            </a>
            
            <a  href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="Instagram"
              
            >
              <FiInstagram size={16} />
            </a>
          </div>
        </div>

        {/* ── Collections ──────────────────────────── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Collections</h4>
          <ul className="footer-links">
            <li><a href="/homme">Homme</a></li>
            <li><a href="/femme">Femme</a></li>
            <li><a href="/enfant">Enfants</a></li>
          </ul>
        </div>

        {/* ── Info ─────────────────────────────────── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Informations</h4>
          
               <div className="footer-contact">
            <div className="footer-contact-item">
              
              <FiMapPin size={12} />
              <span>Sfax, Tunisie</span>
            </div>
            <div className="footer-contact-item">
              <FiPhone size={12} />
              <span>+216 55 000 111</span>
            </div>
            <div className="footer-contact-item">
              <FiMail size={14} />
              <span>contact@mansour.tn</span>
            </div>
          </div>
        </div>

        {/* ── Delivery ─────────────────────────────── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Livraison</h4>
          <div className="footer-delivery">
            <div className="footer-delivery-item">
              <span className="footer-delivery-icon">🚚</span>
              <div>
                <p className="footer-delivery-label">Livraison à domicile</p>
                <p className="footer-delivery-value">8 DT partout en Tunisie</p>
              </div>
            </div>
            <div className="footer-delivery-item">
              <span className="footer-delivery-icon">💵</span>
              <div>
                <p className="footer-delivery-label">Paiement</p>
                <p className="footer-delivery-value">À la livraison uniquement</p>
              </div>
            </div>
            <div className="footer-delivery-item">
              <span className="footer-delivery-icon">↩</span>
              <div>
                <p className="footer-delivery-label">Retours</p>
                <p className="footer-delivery-value">Sous 14 jours</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ───────────────────────────────── */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Mansour Shoes. Tous droits réservés.</p>
        <p className="footer-bottom-right">
          Fait avec ❤️ en Tunisie
        </p>
      </div>
    </footer>
  )
}