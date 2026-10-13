import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, HelpCircle } from 'lucide-react';
import { api } from '../api/client.js';

export default function AssistantPage() {
  const [questionsSuggestions, setQuestionsSuggestions] = useState([]);
  const [historique, setHistorique] = useState([
    {
      expediteur: 'bot',
      texte: "Bonjour ! Je suis votre assistant CashPilot. Posez-moi une question sur vos créances, vos retards ou vos encaissements, ou choisissez l'une des suggestions ci-dessous.",
    },
  ]);
  const [saisie, setSaisie] = useState('');
  const [chargement, setChargement] = useState(false);
  const finDiscussionRef = useRef(null);

  // Charger les questions suggérées au montage
  useEffect(() => {
    api('/assistant/questions')
      .then((res) => setQuestionsSuggestions(res))
      .catch(() => setQuestionsSuggestions([]));
  }, []);

  // Défilement automatique vers le bas lors de nouveaux messages
  useEffect(() => {
    finDiscussionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historique, chargement]);

  const poserQuestion = async (texteQuestion) => {
    const q = texteQuestion.trim();
    if (!q || chargement) return;

    setSaisie('');
    setHistorique((prec) => [...prec, { expediteur: 'user', texte: q }]);
    setChargement(true);

    try {
      const res = await api('/assistant', {
        methode: 'POST',
        corps: { question: q },
      });
      setHistorique((prec) => [...prec, { expediteur: 'bot', texte: res.reponse }]);
    } catch (err) {
      setHistorique((prec) => [
        ...prec,
        { expediteur: 'bot', texte: err.message || "Une erreur est survenue lors de la communication avec l'assistant." },
      ]);
    } finally {
      setChargement(false);
    }
  };

  const soumettre = (e) => {
    e.preventDefault();
    poserQuestion(saisie);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', maxWidth: '900px', margin: '0 auto' }}>
      {/* En-tête */}
      <div className="entete-page" style={{ marginBottom: '1rem' }}>
        <div>
          <h1>Assistant Trésorerie & IA</h1>
          <p className="muted">Interrogez les données de votre entreprise en langage naturel.</p>
        </div>
      </div>

      {/* Suggestions de questions rapides */}
      {questionsSuggestions.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {questionsSuggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => poserQuestion(item.question)}
              style={{
                background: '#f1f0eb',
                border: '1px solid #e7e4da',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: '#1d2128',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <HelpCircle size={13} color="#057a55" />
              {item.question}
            </button>
          ))}
        </div>
      )}

      {/* Zone de discussion (Chat) */}
      <div
        className="panneau"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1rem',
          background: '#faf9f5',
        }}
      >
        {historique.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              alignSelf: msg.expediteur === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            {msg.expediteur === 'bot' && (
              <div
                style={{
                  background: '#057a55',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={18} />
              </div>
            )}
            <div
              style={{
                background: msg.expediteur === 'user' ? '#057a55' : '#ffffff',
                color: msg.expediteur === 'user' ? '#ffffff' : '#1d2128',
                padding: '0.9rem 1.1rem',
                borderRadius: msg.expediteur === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                whiteSpace: 'pre-line',
                lineHeight: '1.5',
                fontSize: '0.95rem',
                border: msg.expediteur === 'bot' ? '1px solid #e7e4da' : 'none',
              }}
            >
              {msg.texte}
            </div>
            {msg.expediteur === 'user' && (
              <div
                style={{
                  background: '#1d2128',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {chargement && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div
              style={{
                background: '#057a55',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={18} />
            </div>
            <div className="muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
              L'assistant analyse vos données…
            </div>
          </div>
        )}
        <div ref={finDiscussionRef} />
      </div>

      {/* Formulaire de saisie */}
      <form onSubmit={soumettre} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Posez votre question (ex: Qui me doit le plus d'argent ?)..."
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          disabled={chargement}
          style={{
            flex: 1,
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
            outline: 'none',
            background: '#ffffff',
          }}
        />
        <button
          type="submit"
          className="bouton bouton-principal"
          disabled={chargement || !saisie.trim()}
          style={{ padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Send size={16} />
          Envoyer
        </button>
      </form>
    </div>
  );
}