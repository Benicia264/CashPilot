import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { fcfa, dateCourte } from '../utils/format.js';

const STATUTS_CONFIG = {
  payee: { libelle: 'Payée', classe: 'badge-payee' },
  en_attente: { libelle: 'En attente', classe: 'badge-attente' },
  en_retard: { libelle: 'En retard', classe: 'badge-retard' },
  annulee: { libelle: 'Annulée', classe: 'badge-annulee' },
};

export default function FacturesPage() {
  const { peutModifier } = useAuth();
  const { donnees: factures, recharger: rechargerFactures, erreur } = useApi('/factures');
  const { donnees: clients } = useApi('/clients');
  
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [formulaire, setFormulaire] = useState({
    numero: '',
    clientId: '',
    montant: '',
    dateEcheance: '',
  });
  const [chargementEnvoi, setChargementEnvoi] = useState(false);
  const [erreurForm, setErreurForm] = useState('');

  // Génération automatique d'un numéro de facture incrémenté
  useEffect(() => {
    if (factures) {
      const prochainNumero = `F-${String(factures.length + 1).padStart(3, '0')}`;
      setFormulaire((prec) => ({ ...prec, numero: prochainNumero }));
    }
  }, [factures, afficherFormulaire]);

  const modifierChamp = (champ) => (e) => {
    setFormulaire((prec) => ({ ...prec, [champ]: e.target.value }));
  };

  const soumettreFacture = async (e) => {
    e.preventDefault();
    setErreurForm('');
    setChargementEnvoi(true);
    try {
      await api('/factures', {
        methode: 'POST',
        corps: {
          numero: formulaire.numero,
          clientId: Number(formulaire.clientId),
          montant: Number(formulaire.montant),
          dateEcheance: formulaire.dateEcheance,
        },
      });
      setFormulaire({ numero: '', clientId: '', montant: '', dateEcheance: '' });
      setAfficherFormulaire(false);
      rechargerFactures();
    } catch (err) {
      setErreurForm(err.message || "Erreur lors de l'enregistrement de la facture.");
    } finally {
      setChargementEnvoi(false);
    }
  };

  return (
    <div>
      {/* En-tête de la page */}
      <div className="entete-page">
        <div>
          <h1>Factures</h1>
          <p className="muted">Suivez vos encaissements et l'état de vos factures clients.</p>
        </div>
        {peutModifier && (
          <button 
            className="bouton bouton-principal" 
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
          >
            <Plus size={18} strokeWidth={2} />
            {afficherFormulaire ? 'Fermer' : 'Nouvelle facture'}
          </button>
        )}
      </div>

      {/* Formulaire d'ajout rapide de facture */}
      {afficherFormulaire && (
        <div className="panneau" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Enregistrer une nouvelle facture</h3>
          {erreurForm && <div className="message-erreur">{erreurForm}</div>}
          
          <form onSubmit={soumettreFacture} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="numero">Numéro de facture</label>
              <input
                id="numero"
                required
                value={formulaire.numero}
                onChange={modifierChamp('numero')}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="clientId">Client</label>
              <select
                id="clientId"
                required
                value={formulaire.clientId}
                onChange={modifierChamp('clientId')}
              >
                <option value="">Sélectionner un client</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="montant">Montant (FCFA)</label>
              <input
                id="montant"
                type="number"
                required
                placeholder="Ex : 500000"
                value={formulaire.montant}
                onChange={modifierChamp('montant')}
              />
            </div>

            <div className="champ" style={{ margin: 0 }}>
              <label htmlFor="dateEcheance">Date d'échéance</label>
              <input
                id="dateEcheance"
                type="date"
                required
                value={formulaire.dateEcheance}
                onChange={modifierChamp('dateEcheance')}
              />
            </div>

            <button className="bouton bouton-principal" disabled={chargementEnvoi} style={{ height: '46px' }}>
              {chargementEnvoi ? 'Enregistrement…' : 'Ajouter la facture'}
            </button>
          </form>
        </div>
      )}

      {/* Gestion des erreurs d'API */}
      {erreur && (
        <div className="message-erreur">
          Impossible de charger les factures : {erreur.message}
        </div>
      )}

      {/* Tableau des factures */}
      <div className="panneau">
        <div className="tableau-conteneur">
          <table className="tableau">
            <thead>
              <tr>
                <th>Facture</th>
                <th>Client</th>
                <th>Échéance</th>
                <th className="nombre">Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {factures && factures.length > 0 ? (
                factures.map((f) => {
                  const statutInfo = STATUTS_CONFIG[f.statut] || { libelle: f.statut, classe: 'badge-neutre' };
                  return (
                    <tr key={f.id || f.numero}>
                      <td>
                        <strong>{f.numero}</strong>
                      </td>
                      <td>{f.clientNom || f.client?.nom || 'Client'}</td>
                      <td>{dateCourte(f.dateEcheance)}</td>
                      <td className="nombre"><strong>{fcfa(f.montant)}</strong></td>
                      <td>
                        <span className={`badge ${statutInfo.classe}`}>
                          {statutInfo.libelle}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }} className="muted">
                    {factures ? 'Aucune facture enregistrée pour le moment.' : 'Chargement des factures…'}
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