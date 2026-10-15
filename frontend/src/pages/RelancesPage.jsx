import { useState } from 'react';
import { Play, Trash2, Plus, MessageSquare } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { dateCourte } from '../utils/format.js';

const STATUTS_CONFIG = {
  a_envoyer: { libelle: 'À envoyer (WhatsApp)', classe: 'badge-retard' },
  envoyee: { libelle: 'Envoyée', classe: 'badge-payee' },
  echec: { libelle: 'Échec', classe: 'badge-annulee' },
};

export default function RelancesPage() {
  const { peutModifier } = useAuth();

  // API Backend : Récupération de l'historique des relances et des règles
  const { donnees: relances, recharger: rechargerRelances, erreur: erreurRelances } = useApi('/relances');
  const { donnees: regles, recharger: rechargerRegles } = useApi('/relances/regles');

  const [onglet, setOnglet] = useState('historique'); // 'historique' ou 'regles'
  const [chargementExec, setChargementExec] = useState(false);
  const [bilanExec, setBilanExec] = useState(null);

  // Formulaire pour ajouter une règle
  const [afficherFormRegle, setAfficherFormRegle] = useState(false);
  const [nouvelleRegle, setNouvelleRegle] = useState({
    joursRetard: 7,
    message: 'Bonjour {client}, nous vous rappelons que la facture {numero} de {reste} FCFA est arrivée à échéance le {echeance}. Merci de procéder au règlement.',
  });
  const [erreurRegleForm, setErreurRegleForm] = useState('');

  // Exécution du moteur de relances
  const lancerRelances = async () => {
    setChargementExec(true);
    setBilanExec(null);
    try {
      const res = await api('/relances/executer', { methode: 'POST' });
      setBilanExec(res);
      rechargerRelances();
    } catch (err) {
      alert(err.message || "Erreur lors de l'exécution du moteur de relances.");
    } finally {
      setChargementExec(false);
    }
  };

  // Marquer une relance WhatsApp comme envoyée
  const marquerCommeEnvoyee = async (id) => {
    try {
      await api(`/relances/${id}/envoyee`, { methode: 'PATCH' });
      rechargerRelances();
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour.');
    }
  };

  // Réessayer un envoi en échec
  const renvoyerRelance = async (id) => {
    try {
      await api(`/relances/${id}/renvoyer`, { methode: 'POST' });
      rechargerRelances();
    } catch (err) {
      alert(err.message || 'Échec du renvoi.');
    }
  };

  // Création d'une nouvelle règle de relance
  const soumettreRegle = async (e) => {
    e.preventDefault();
    setErreurRegleForm('');
    try {
      await api('/relances/regles', {
        methode: 'POST',
        corps: {
          joursRetard: Number(nouvelleRegle.joursRetard),
          message: nouvelleRegle.message,
          actif: true,
        },
      });
      setAfficherFormRegle(false);
      rechargerRegles();
    } catch (err) {
      setErreurRegleForm(err.message || 'Impossible de créer la règle.');
    }
  };

  // Suppression d'une règle
  const supprimerRegle = async (id) => {
    if (!window.confirm('Voulez-vous supprimer cette règle de relance ?')) return;
    try {
      await api(`/relances/regles/${id}`, { methode: 'DELETE' });
      rechargerRegles();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      {/* En-tête */}
      <div className="entete-page">
        <div>
          <h1>Relances Clients</h1>
          <p className="muted">Automatisations et suivi des relances pour vos factures en retard.</p>
        </div>

        {peutModifier && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="bouton bouton-principal"
              disabled={chargementExec}
              onClick={lancerRelances}
            >
              <Play size={17} strokeWidth={2} />
              {chargementExec ? 'Génération…' : 'Générer les relances'}
            </button>
          </div>
        )}
      </div>

      {/* Onglets de navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e7e4da', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setOnglet('historique')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: onglet === 'historique' ? '#057a55' : 'transparent',
            color: onglet === 'historique' ? '#fff' : '#1d2128',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Historique & Envois
        </button>
        <button
          type="button"
          onClick={() => setOnglet('regles')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: onglet === 'regles' ? '#057a55' : 'transparent',
            color: onglet === 'regles' ? '#fff' : '#1d2128',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Règles & Modèles de message
        </button>
      </div>

      {/* Rapport d'exécution */}
      {bilanExec && (
        <div className="panneau" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#e6f4ea', border: '1px solid #b7e4c7' }}>
          <strong style={{ color: '#0d543a' }}>Résultat de la génération :</strong>
          <ul style={{ margin: '0.5rem 0 0 1.25rem', color: '#0d543a', fontSize: '0.9rem' }}>
            <li>{bilanExec.envoyees.length} relance(s) envoyée(s) par email</li>
            <li>{bilanExec.aEnvoyer.length} relance(s) prêtes pour WhatsApp</li>
            {bilanExec.ignorees.length > 0 && <li>{bilanExec.ignorees.length} facture(s) ignorée(s) (contact manquant)</li>}
            {bilanExec.echecs.length > 0 && <li style={{ color: '#b91c1c' }}>{bilanExec.echecs.length} échec(s)</li>}
          </ul>
        </div>
      )}

      {/* ONGLET 1 : HISTORIQUE */}
      {onglet === 'historique' && (
        <div>
          {erreurRelances && <div className="message-erreur" style={{ marginBottom: '1rem' }}>{erreurRelances.message}</div>}

          <div className="panneau">
            <div className="tableau-conteneur">
              <table className="tableau">
                <thead>
                  <tr>
                    <th>Facture</th>
                    <th>Client</th>
                    <th>Canal</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {relances && relances.length > 0 ? (
                    relances.map((r) => {
                      const st = STATUTS_CONFIG[r.statut] || { libelle: r.statut, classe: 'badge-neutre' };
                      return (
                        <tr key={r.id}>
                          <td><strong>{r.numero}</strong></td>
                          <td>{r.client}</td>
                          <td style={{ textTransform: 'capitalize' }}>{r.canal}</td>
                          <td>{dateCourte(r.envoyeeLe || r.created_at)}</td>
                          <td>
                            <span className={`badge ${st.classe}`}>{st.libelle}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {r.canal === 'whatsapp' && r.statut === 'a_envoyer' && r.lienWhatsApp && (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <a
                                  href={r.lienWhatsApp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bouton"
                                  style={{ background: '#25D366', color: '#fff', padding: '0.35rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <MessageSquare size={14} /> WhatsApp
                                </a>
                                <button
                                  type="button"
                                  onClick={() => marquerCommeEnvoyee(r.id)}
                                  className="bouton bouton-secondaire"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                >
                                  Marquer envoyée
                                </button>
                              </div>
                            )}

                            {r.statut === 'echec' && (
                              <button
                                type="button"
                                onClick={() => renvoyerRelance(r.id)}
                                className="bouton bouton-secondaire"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#b91c1c' }}
                              >
                                Réessayer
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }} className="muted">
                        {relances ? 'Aucune relance générée pour le moment. Cliquez sur "Générer les relances".' : 'Chargement…'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2 : RÈGLES */}
      {onglet === 'regles' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p className="muted" style={{ margin: 0 }}>
              Définissez le nombre de jours de retard pour déclencher automatiquement les messages.
            </p>
            {peutModifier && (
              <button
                type="button"
                className="bouton bouton-secondaire"
                onClick={() => setAfficherFormRegle(!afficherFormRegle)}
              >
                <Plus size={16} /> {afficherFormRegle ? 'Fermer' : 'Nouvelle règle'}
              </button>
            )}
          </div>

          {afficherFormRegle && (
            <div className="panneau" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Ajouter une règle de relance</h3>
              {erreurRegleForm && <div className="message-erreur" style={{ marginBottom: '1rem' }}>{erreurRegleForm}</div>}
              <form onSubmit={soumettreRegle}>
                <div className="champ" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="joursRetard">Déclencher après X jours de retard</label>
                  <input
                    id="joursRetard"
                    type="number"
                    min="0"
                    required
                    value={nouvelleRegle.joursRetard}
                    onChange={(e) => setNouvelleRegle({ ...nouvelleRegle, joursRetard: e.target.value })}
                  />
                </div>
                <div className="champ" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="msgModele">Modèle du message</label>
                  <textarea
                    id="msgModele"
                    rows="3"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
                    value={nouvelleRegle.message}
                    onChange={(e) => setNouvelleRegle({ ...nouvelleRegle, message: e.target.value })}
                  />
                  <span className="aide" style={{ fontSize: '0.8rem', color: '#667080', display: 'block', marginTop: '0.25rem' }}>
                    Variables : <code>{'{client}'}</code>, <code>{'{numero}'}</code>, <code>{'{reste}'}</code>, <code>{'{echeance}'}</code>, <code>{'{jours}'}</code>
                  </span>
                </div>
                <button className="bouton bouton-principal">Enregistrer la règle</button>
              </form>
            </div>
          )}

          <div className="panneau">
            <div className="tableau-conteneur">
              <table className="tableau">
                <thead>
                  <tr>
                    <th>Délai de retard</th>
                    <th>Message type</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {regles && regles.length > 0 ? (
                    regles.map((rg) => (
                      <tr key={rg.id}>
                        <td><strong>{rg.joursRetard} jours après échéance</strong></td>
                        <td style={{ maxWidth: '400px', fontSize: '0.875rem' }}>{rg.message}</td>
                        <td style={{ textAlign: 'right' }}>
                          {peutModifier && (
                            <button
                              type="button"
                              onClick={() => supprimerRegle(rg.id)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
                              title="Supprimer la règle"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '2.5rem' }} className="muted">
                        Aucune règle configurée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}