import { useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/pages.css';

// Fenêtre centrée sur ordinateur, feuille qui monte du bas sur téléphone
export default function Modal({ titre, onFermer, children }) {
  useEffect(() => {
    const surTouche = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', surTouche);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', surTouche);
      document.body.style.overflow = '';
    };
  }, [onFermer]);

  return (
    <div className="modal-fond" onMouseDown={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titre}>
        <div className="modal-entete">
          <h2>{titre}</h2>
          <button type="button" className="bouton-icone" onClick={onFermer} aria-label="Fermer">
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}