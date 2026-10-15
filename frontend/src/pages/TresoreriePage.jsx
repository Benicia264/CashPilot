import { useState, useMemo } from 'react';
import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { CourbeTresorerie } from '../components/Graphiques.jsx';
import { fcfa, dateCourte } from '../utils/format.js';

export default function TresoreriePage() {
  const { peutModifier } = useAuth();
  const [scenario, setScenario] = useState('prudent');

  const projection = useApi(`/tresorerie/projection?scenario=${scenario}`);
  const mouvementsApi = useApi('/tresorerie/mouvements');

  const [nouveauSolde, setNouveauSolde] = useState('');
  const [erreurSolde, setErreurSolde] = useState('');
  const [chargementSolde, setChargementSolde] = useState(false);

  const [afficherMvtForm, setAfficherMvtForm] = useState(false);
  const [mouvementForm, setMouvementForm] = useState({
    libelle: '',
    type: 'depense',
    montant: '',
    datePrevue: '',
    recurrence: 'aucune',
  });
  const [erreurMvt, setErreurMvt] = useState('');
  const [chargementMvt, setChargementMvt] = useState(false);

  const p = projection.donnees;
  const mouvements = mouvementsApi.donnees || [];

  const serie = useMemo(() => {
    if (!p) return [];
    const debut = new Date(`${p.aujourdhui}T00:00:00Z`);
    const parJour = new Map(p.evenements.map((e) => [e.date, e.soldeApres]));
    let courant = p.soldeActuel.montant;
    return Array.from({ length: 91 }, (_, i) => {
      const jour = new Date(debut);
      jour.setUTCDate(jour.getUTCDate() + i);
      const cle = jour.toISOString().slice(0, 10);
      if (parJour.has(cle)) courant = parJour.get(cle);
      return { date: cle, solde: courant };
    });
  }, [p]);

  const soumettreSolde = async (e) => {
    e.preventDefault();
    setErreurSolde('');
    setChargementSolde(true);
    try {
      await api('/tresorerie/solde', {
        methode: 'POST',
        corps: { montant: Number(nouveauSolde) },
      });
      setNouveauSolde('');
      projection.recharger();
    } catch (err) {
      setErreurSolde(err.message || "Erreur lors de l'enregistrement du solde.");
    } finally {
      setChargementSolde(false);
    }
  };

  const soumettreMouvement = async (e) => {
    e.preventDefault();
    setErreurMvt('');
    setChargementMvt(true);
    try {
      await api('/tresorerie/mouvements', {
        methode: 'POST',
        corps: {
          libelle: mouvementForm.libelle.trim(),
          type: mouvementForm.type,
          montant: Number(mouvementForm.montant),
          datePrevue: mouvementForm.datePrevue,
          recurrence: mouvementForm.recurrence,
        },
      });
      setMouvementForm({ libelle: '', type: 'depense', montant: '', datePrevue: '', recurrence: 'aucune' });
      setAfficherMvtForm(false);
      await Promise.all([mouvementsApi.recharger(), projection.recharger()]);
    } catch (err) {
      setErreurMvt(err.message || "Erreur lors de l'ajout du mouvement.");
    } finally {
      setChargementMvt(false);
    }
  };

  const supprimerMvt = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce mouvement prévu ?")) return;
    try {
      await api(`/tresorerie/mouvements/${id}`, { methode: 'DELETE' });
      await Promise.all([mouvementsApi.recharger(), projection.recharger()]);
    } catch (err) {
      alert(err.message || "Impossible de supprimer le mouvement.");
    }
  };

  return (
    <div>
      {/* En-tête */}
      <div className="entete-page">
        <div>
          <h1>Trésorerie & Prévisions</h1>
          <p className="muted">Anticipez votre solde en caisse à 30, 60 et 90 jours.</p>
        </div>
        {peutModifier && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="bouton bouton-secondaire" 
              onClick={() => setAfficherMvtForm(!afficherMvtForm)}
            >
              <Plus size={17} strokeWidth={2} />
              {afficherMvtForm ? 'Fermer' : 'Ajouter un mouvement'}
            </button>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout de mouvement prévu */}
      {afficherMvtForm && (
        <div className="panneau" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Nouveau mouvement prévu (Dépense ou Recette)</h3>
          {erreurMvt && <div className="message-erreur" style={{ marginBottom: '1rem' }}>{erreurMvt}</div>}
          
          <form onSubmit={soumettreMouvement} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="libelle">Libellé *</label>
              <input
                id="libelle"
                required
                placeholder="Ex : Loyer Bureau"
                value={mouvementForm.libelle}
                onChange={(e) => setMouvementForm({ ...mouvementForm, libelle: e.target.value })}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={mouvementForm.type}
                onChange={(e) => setMouvementForm({ ...mouvementForm, type: e.target.value })}
              >
                <option value="depense">Dépense (Sortie)</option>
                <option value="recette">Recette (Entrée)</option>
              </select>
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="montantMvt">Montant (FCFA) *</label>
              <input
                id="montantMvt"
                type="number"
                required
                min="1"
                placeholder="Ex : 250000"
                value={mouvementForm.montant}
                onChange={(e) => setMouvementForm({ ...mouvementForm, montant: e.target.value })}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="datePrevue">Date prévue *</label>
              <input
                id="datePrevue"
                type="date"
                required
                value={mouvementForm.datePrevue}
                onChange={(e) => setMouvementForm({ ...mouvementForm, datePrevue: e.target.value })}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="recurrence">Récurrence</label>
              <select
                id="recurrence"
                value={mouvementForm.recurrence}
                onChange={(e) => setMouvementForm({ ...mouvementForm, recurrence: e.target.value })}
              >
                <option value="aucune">Ponctuel</option>
                <option value="hebdo">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
                <option value="annuelle">Annuelle</option>
              </select>
            </div>

            <button className="bouton bouton-principal" disabled={chargementMvt} style={{ height: '46px' }}>
              {chargementMvt ? 'Enregistrement…' : 'Ajouter'}
            </button>
          </form>
        </div>
      )}

      {/* Carte principale de projection */}
      <div className="panneau" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Évolution de la trésorerie</h2>
            <p className="muted">
              {p ? `Solde actuel : ${fcfa(p.soldeActuel.montant)} (au ${dateCourte(p.soldeActuel.dateSolde)})` : 'Chargement du solde…'}
            </p>
          </div>
          <div className="segment" role="group" aria-label="Scénario">
            {[
              ['prudent', 'Prudent'],
              ['probable', 'Probable'],
            ].map(([valeur, libelle]) => (
              <button
                key={valeur}
                type="button"
                className={scenario === valeur ? 'actif' : ''}
                onClick={() => setScenario(valeur)}
                style={{ padding: '0.4rem 1rem', cursor: 'pointer', border: 'none', background: scenario === valeur ? '#057a55' : '#efede7', color: scenario === valeur ? '#fff' : '#1d2128', borderRadius: '8px', fontWeight: 600 }}
              >
                {libelle}
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire de mise à jour du solde si inexistant */}
        {projection.erreur?.statut === 409 || !p ? (
          <form onSubmit={soumettreSolde} style={{ padding: '2rem 0', maxWidth: '400px' }}>
            <h3>Renseignez votre solde actuel</h3>
            <p className="muted" style={{ marginBottom: '1rem' }}>Point de départ obligatoire pour calculer les projections à 90 jours.</p>
            {erreurSolde && <div className="message-erreur">{erreurSolde}</div>}
            <div className="champ" style={{ marginBottom: '1rem' }}>
              <label htmlFor="soldeActuel">Solde en caisse et en banque (FCFA)</label>
              <input
                id="soldeActuel"
                type="number"
                required
                value={nouveauSolde}
                onChange={(e) => setNouveauSolde(e.target.value)}
                placeholder="Ex : 1000000"
              />
            </div>
            <button className="bouton bouton-principal" disabled={chargementSolde}>
              {chargementSolde ? 'Enregistrement…' : 'Enregistrer le solde'}
            </button>
          </form>
        ) : projection.erreur ? (
          <div className="message-erreur">{projection.erreur.message}</div>
        ) : (
          <>
            {p.alertes.length > 0 ? (
              <div className="d-alerte" style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                <TriangleAlert size={18} />
                <span>{p.alertes[0]}</span>
              </div>
            ) : (
              <div className="d-alerte ok" style={{ background: '#e6f4ea', color: '#0d543a', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
                Aucun découvert prévu sur les 90 prochains jours.
              </div>
            )}

            {/* Conteneur du graphique */}
            <div style={{ width: '100%', height: '280px', margin: '1.5rem 0' }}>
              <CourbeTresorerie serie={serie} />
            </div>

            {/* Horizons de trésorerie */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
              {p.horizons.map((h) => (
                <div key={h.jours} className="panneau" style={{ background: '#f8f7f3', padding: '1.25rem', border: '1px solid #e7e4da', borderRadius: '12px' }}>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>À {h.jours} jours ({dateCourte(h.dateFin)})</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'Sora, sans-serif', margin: '0.5rem 0', color: h.soldePrevu < 0 ? '#b91c1c' : '#0b1530' }}>
                    {fcfa(h.soldePrevu)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#667080' }}>
                    Min. prévu : {fcfa(h.soldeMinimum)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Liste des mouvements prévus enregistrés */}
      <div className="panneau">
        <h3 style={{ marginBottom: '1rem' }}>Mouvements récurrents et prévus enregistrés</h3>
        <div className="tableau-conteneur">
          <table className="tableau">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Type</th>
                <th>Date prévue</th>
                <th>Récurrence</th>
                <th className="nombre">Montant</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mouvements.length > 0 ? (
                mouvements.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.libelle}</strong></td>
                    <td>
                      <span className={`badge ${m.type === 'recette' ? 'badge-payee' : 'badge-retard'}`}>
                        {m.type === 'recette' ? 'Recette' : 'Dépense'}
                      </span>
                    </td>
                    <td>{dateCourte(m.datePrevue)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{m.recurrence}</td>
                    <td className="nombre">
                      <strong style={{ color: m.type === 'recette' ? '#057a55' : '#b91c1c' }}>
                        {m.type === 'recette' ? '+' : '-'}{fcfa(m.montant)}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {peutModifier && (
                        <button
                          onClick={() => supprimerMvt(m.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
                          title="Supprimer"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem' }} className="muted">
                    Aucun mouvement prévu enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}