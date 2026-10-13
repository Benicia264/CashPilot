import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { pluriel } from '../utils/format.js';
import '../styles/pages.css';

const CANAUX = { email: 'Email', whatsapp: 'WhatsApp', sms: 'SMS' };

function FormulaireClient({ client, surSucces, surAnnulation }) {
  const [valeurs, setValeurs] = useState({
    nom: client?.nom ?? '',
    email: client?.email ?? '',
    telephone: client?.telephone ?? '',
    canalPrefere: client?.canalPrefere ?? 'email',
  });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const changer = (champ) => (e) => setValeurs((v) => ({ ...v, [champ]: e.target.value }));

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    const corps = {
      nom: valeurs.nom.trim(),
      email: valeurs.email.trim() || null,
      telephone: valeurs.telephone.trim() || null,
      canalPrefere: valeurs.canalPrefere,
    };
    try {
      if (client) await api(`/clients/${client.id}`, { methode: 'PUT', corps });
      else await api('/clients', { methode: 'POST', corps });
      surSucces(client ? 'Client modifié' : 'Client ajouté');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="panneau" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0 }}>{client ? 'Modifier le client' : 'Enregistrer un nouveau client'}</h3>
        <button
          type="button"
          onClick={surAnnulation}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#667080' }}
        >
          <X size={20} />
        </button>
      </div>

      {erreur && <div className="message-erreur" style={{ marginBottom: '1rem' }}>{erreur}</div>}

      <form onSubmit={soumettre}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="champ" style={{ margin: 0 }}>
            <label htmlFor="c-nom">Nom du client *</label>
            <input
              id="c-nom"
              required
              maxLength={150}
              autoFocus
              placeholder="Ex : Boulangerie Ngoma"
              value={valeurs.nom}
              onChange={changer('nom')}
            />
          </div>

          <div className="champ" style={{ margin: 0 }}>
            <label htmlFor="c-email">Email</label>
            <input
              id="c-email"
              type="email"
              autoComplete="off"
              placeholder="vous@entreprise.com"
              value={valeurs.email}
              onChange={changer('email')}
            />
          </div>

          <div className="champ" style={{ margin: 0 }}>
            <label htmlFor="c-tel">Téléphone</label>
            <input
              id="c-tel"
              type="tel"
              autoComplete="off"
              placeholder="+242 06 123 45 67"
              value={valeurs.telephone}
              onChange={changer('telephone')}
            />
            <span className="aide" style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#667080' }}>
              Avec l'indicatif du pays pour WhatsApp, par exemple +242 06 123 45 67.
            </span>
          </div>

          <div className="champ" style={{ margin: 0 }}>
            <label htmlFor="c-canal">Canal de relance préféré</label>
            <select id="c-canal" value={valeurs.canalPrefere} onChange={changer('canalPrefere')}>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              {valeurs.canalPrefere === 'sms' && <option value="sms">SMS</option>}
            </select>
            <span className="aide" style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#667080' }}>
              {valeurs.canalPrefere === 'whatsapp'
                ? 'Un numéro de téléphone est nécessaire.'
                : 'Une adresse email est nécessaire.'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="bouton bouton-secondaire" onClick={surAnnulation}>
            Annuler
          </button>
          <button className="bouton bouton-principal" disabled={envoi || !valeurs.nom.trim()}>
            {envoi ? 'Enregistrement…' : client ? 'Enregistrer' : 'Ajouter le client'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ClientsPage() {
  const { peutModifier } = useAuth();
  const { donnees, erreur, chargement, recharger } = useApi('/clients');
  const [recherche, setRecherche] = useState('');
  const [edition, setEdition] = useState(null); // null, 'nouveau' ou un client
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState('');
  const [erreurSuppression, setErreurSuppression] = useState('');

  const liste = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return (donnees ?? []).filter(
      (c) =>
        !terme ||
        [c.nom, c.email, c.telephone].some((v) => v && v.toLowerCase().includes(terme))
    );
  }, [donnees, recherche]);

  const annoncer = (texte) => {
    setMessage(texte);
    setTimeout(() => setMessage(''), 3500);
  };

  const apresEnregistrement = (texte) => {
    setEdition(null);
    annoncer(texte);
    recharger();
  };

  const supprimer = async () => {
    setErreurSuppression('');
    try {
      await api(`/clients/${aSupprimer.id}`, { methode: 'DELETE' });
      setASupprimer(null);
      annoncer('Client supprimé');
      recharger();
    } catch (err) {
      setErreurSuppression(
        err.statut === 409
          ? 'Ce client a des factures : il ne peut pas être supprimé.'
          : err.message
      );
    }
  };

  const total = donnees?.length ?? 0;

  return (
    <div>
      <div className="entete-page">
        <div>
          <h1>Clients</h1>
          <p className="muted">{donnees ? pluriel(total, 'client') : 'Chargement…'}</p>
        </div>
        {peutModifier && (
          <button 
            className="bouton bouton-principal" 
            onClick={() => setEdition(edition ? null : 'nouveau')}
          >
            <Plus size={17} strokeWidth={2} />
            {edition ? 'Fermer' : 'Ajouter un client'}
          </button>
        )}
      </div>

      {message && (
        <div className="notice" role="status" style={{ marginBottom: '1rem' }}>
          {message}
        </div>
      )}
      {erreur && <div className="message-erreur" style={{ marginBottom: '1rem' }}>{erreur.message}</div>}

      {/* Formulaire intégré dans la page avec tous ses textes d'explication */}
      {edition && (
        <FormulaireClient
          client={edition === 'nouveau' ? null : edition}
          surSucces={apresEnregistrement}
          surAnnulation={() => setEdition(null)}
        />
      )}

      {total > 0 && (
        <label className="recherche" style={{ marginBottom: '1.25rem' }}>
          <Search size={17} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            placeholder="Rechercher un client"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            aria-label="Rechercher un client"
          />
        </label>
      )}

      {donnees && total === 0 && !edition && (
        <div className="etat-vide">
          <div className="etat-vide-icone">
            <Users size={22} strokeWidth={1.8} />
          </div>
          <h2>Ajoutez votre premier client</h2>
          <p className="muted">
            Vos clients apparaissent ici. Vous pourrez ensuite leur associer des factures et
            relancer ceux qui tardent à payer.
          </p>
          {peutModifier && (
            <button
              className="bouton bouton-principal"
              style={{ marginTop: '1.25rem' }}
              onClick={() => setEdition('nouveau')}
            >
              <Plus size={17} strokeWidth={2} />
              Ajouter un client
            </button>
          )}
        </div>
      )}

      {total > 0 && (
        <div className="panneau liste-clients">
          {liste.map((c) => (
            <div className="ligne-client" key={c.id}>
              <span className="initiale">{c.nom.charAt(0).toUpperCase()}</span>
              <div className="client-id">
                <strong>{c.nom}</strong>
                <span className="client-id-contact">{c.email || c.telephone || 'Aucun contact'}</span>
              </div>
              <div className="client-contact">
                <span>{c.email || '—'}</span>
                <span>{c.telephone || '—'}</span>
              </div>
              <span className={`badge ${c.canalPrefere === 'whatsapp' ? 'badge-ok' : 'badge-neutre'}`}>
                {CANAUX[c.canalPrefere] ?? c.canalPrefere}
              </span>
              {peutModifier && (
                <div className="actions-ligne">
                  <button
                    className="bouton-icone"
                    onClick={() => setEdition(c)}
                    aria-label={`Modifier ${c.nom}`}
                    title="Modifier"
                  >
                    <Pencil size={16} strokeWidth={1.8} />
                  </button>
                  <button
                    className="bouton-icone danger"
                    onClick={() => {
                      setErreurSuppression('');
                      setASupprimer(c);
                    }}
                    aria-label={`Supprimer ${c.nom}`}
                    title="Supprimer"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {liste.length === 0 && <p className="liste-vide muted">Aucun client ne correspond à votre recherche.</p>}
        </div>
      )}

      {chargement && !donnees && !erreur && <p className="chargement">Chargement…</p>}

      {/* Confirmation de suppression */}
      {aSupprimer && (
        <div className="panneau" style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #fecaca', background: '#fef2f2' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#b91c1c' }}>Supprimer {aSupprimer.nom} ?</h3>
          {erreurSuppression && <div className="message-erreur" style={{ marginBottom: '0.75rem' }}>{erreurSuppression}</div>}
          <p style={{ margin: '0 0 1.25rem', color: '#7f1d1d' }}>
            <strong>{aSupprimer.nom}</strong> sera supprimé définitivement. Cette action ne peut pas être annulée.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="bouton bouton-secondaire" onClick={() => setASupprimer(null)}>
              Annuler
            </button>
            <button className="bouton" style={{ background: '#b91c1c', color: '#ffffff' }} onClick={supprimer}>
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}