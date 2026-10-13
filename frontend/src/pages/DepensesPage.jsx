import { useState, useMemo } from 'react';
import { Plus, Trash2, CreditCard, Calendar, RefreshCw, Search } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { fcfa, dateCourte } from '../utils/format.js';

const RECURRENCES_LIBELLES = {
  aucune: 'Ponctuelle',
  hebdo: 'Hebdomadaire',
  mensuelle: 'Mensuelle',
  annuelle: 'Annuelle',
};

export default function DepensesPage() {
  const { peutModifier } = useAuth();
  const { donnees: tousMouvements, charger: rechargerMouvements, erreur } = useApi('/tresorerie/mouvements');

  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [formulaire, setFormulaire] = useState({
    libelle: '',
    montant: '',
    datePrevue: '',
    recurrence: 'aucune',
  });
  const [chargementEnvoi, setChargementEnvoi] = useState(false);
  const [erreurForm, setErreurForm] = useState('');

  // 1. Filtrer uniquement les mouvements de type 'depense'
  const depenses = useMemo(() => {
    if (!tousMouvements) return [];
    return tousMouvements.filter((m) => m.type === 'depense');
  }, [tousMouvements]);

  // 2. Recherche par libellé
  const depensesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return depenses;
    return depenses.filter((d) => d.libelle.toLowerCase().includes(terme));
  }, [depenses, recherche]);

  // 3. Calculs des totaux
  const totalDepenses = useMemo(() => {
    return depenses.reduce((acc, d) => acc + Number(d.montant), 0);
  }, [depenses]);

  const totalRecurrentes = useMemo(() => {
    return depenses
      .filter((d) => d.recurrence !== 'aucune')
      .reduce((acc, d) => acc + Number(d.montant), 0);
  }, [depenses]);

  const modifierChamp = (champ) => (e) => {
    setFormulaire((prec) => ({ ...prec, [champ]: e.target.value }));
  };

  const soumettreDepense = async (e) => {
    e.preventDefault();
    setErreurForm('');
    setChargementEnvoi(true);
    try {
      await api('/tresorerie/mouvements', {
        methode: 'POST',
        corps: {
          libelle: formulaire.libelle.trim(),
          type: 'depense', // Forcé sur 'depense'
          montant: Number(formulaire.montant),
          datePrevue: formulaire.datePrevue,
          recurrence: formulaire.recurrence,
        },
      });
      setFormulaire({ libelle: '', montant: '', datePrevue: '', recurrence: 'aucune' });
      setAfficherFormulaire(false);
      rechargerMouvements();
    } catch (err) {
      setErreurForm(err.message || "Erreur lors de l'enregistrement de la dépense.");
    } finally {
      setChargementEnvoi(false);
    }
  };

  const supprimerDepense = async (id, libelle) => {
    if (!window.confirm(`Voulez-vous supprimer la dépense "${libelle}" ?`)) return;
    try {
      await api(`/tresorerie/mouvements/${id}`, { methode: 'DELETE' });
      rechargerMouvements();
    } catch (err) {
      alert(err.message || "Impossible de supprimer la dépense.");
    }
  };

  return (
    <div>
      {/* En-tête de la page */}
      <div className="entete-page">
        <div>
          <h1>Dépenses</h1>
          <p className="muted">Gérez et anticipez les charges et sorties d'argent de votre entreprise.</p>
        </div>
        {peutModifier && (
          <button
            className="bouton bouton-principal"
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
          >
            <Plus size={18} strokeWidth={2} />
            {afficherFormulaire ? 'Fermer' : 'Nouvelle dépense'}
          </button>
        )}
      </div>

      {/* Cartes d'indicateurs de dépenses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="panneau" style={{ padding: '1.25rem', borderLeft: '4px solid #b91c1c' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#667080', fontSize: '0.875rem' }}>
            <CreditCard size={18} />
            <span>Total des dépenses prévues</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#0b1530' }}>
            {fcfa(totalDepenses)}
          </div>
        </div>

        <div className="panneau" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#667080', fontSize: '0.875rem' }}>
            <RefreshCw size={18} />
            <span>Charges récurrentes</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#0b1530' }}>
            {fcfa(totalRecurrentes)}
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout rapide de dépense */}
      {afficherFormulaire && (
        <div className="panneau" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Enregistrer une dépense</h3>
          {erreurForm && <div className="message-erreur" style={{ marginBottom: '1rem' }}>{erreurForm}</div>}

          <form onSubmit={soumettreDepense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="libelle">Libellé / Description *</label>
              <input
                id="libelle"
                required
                placeholder="Ex : Loyer bureau, Salaires, Internet..."
                value={formulaire.libelle}
                onChange={modifierChamp('libelle')}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="montant">Montant (FCFA) *</label>
              <input
                id="montant"
                type="number"
                required
                min="1"
                placeholder="Ex : 150000"
                value={formulaire.montant}
                onChange={modifierChamp('montant')}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="datePrevue">Date d'échéance / Paiement *</label>
              <input
                id="datePrevue"
                type="date"
                required
                value={formulaire.datePrevue}
                onChange={modifierChamp('datePrevue')}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="recurrence">Récurrence</label>
              <select
                id="recurrence"
                value={formulaire.recurrence}
                onChange={modifierChamp('recurrence')}
              >
                <option value="aucune">Ponctuelle (Une seule fois)</option>
                <option value="hebdo">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
                <option value="annuelle">Annuelle</option>
              </select>
            </div>

            <button className="bouton bouton-principal" disabled={chargementEnvoi} style={{ height: '46px' }}>
              {chargementEnvoi ? 'Enregistrement…' : 'Ajouter la dépense'}
            </button>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      {depenses.length > 0 && (
        <label className="recherche" style={{ marginBottom: '1.25rem' }}>
          <Search size={17} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            placeholder="Rechercher une dépense..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </label>
      )}

      {/* Message d'erreur API */}
      {erreur && (
        <div className="message-erreur" style={{ marginBottom: '1rem' }}>
          Impossible de charger les dépenses : {erreur.message}
        </div>
      )}

      {/* Tableau des dépenses */}
      <div className="panneau">
        <div className="tableau-conteneur">
          <table className="tableau">
            <thead>
              <tr>
                <th>Dépense</th>
                <th>Date prévue</th>
                <th>Récurrence</th>
                <th className="nombre">Montant</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {depensesFiltrees.length > 0 ? (
                depensesFiltrees.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.libelle}</strong>
                    </td>
                    <td>{dateCourte(d.datePrevue)}</td>
                    <td>
                      <span className={`badge ${d.recurrence !== 'aucune' ? 'badge-ok' : 'badge-neutre'}`}>
                        {RECURRENCES_LIBELLES[d.recurrence] || d.recurrence}
                      </span>
                    </td>
                    <td className="nombre">
                      <strong style={{ color: '#b91c1c' }}>-{fcfa(d.montant)}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {peutModifier && (
                        <button
                          onClick={() => supprimerDepense(d.id, d.libelle)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
                          title="Supprimer cette dépense"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }} className="muted">
                    {tousMouvements
                      ? recherche
                        ? 'Aucune dépense ne correspond à votre recherche.'
                        : 'Aucune dépense enregistrée pour le moment.'
                      : 'Chargement des dépenses…'}
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