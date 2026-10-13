import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingDown, TrendingUp, TriangleAlert, UserPlus } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import {
  BarresClients,
  COULEURS,
  CourbeTresorerie,
  FluxHebdo,
  RepartitionDonut,
} from '../components/Graphiques.jsx';
import { dateCourte, dateLongue, fcfa, nombreFr, pluriel, pourcent, points } from '../utils/format.js';
import '../styles/dashboard.css';

const STATUTS = {
  payee: { libelle: 'Payées', couleur: COULEURS.vert },
  en_attente: { libelle: 'En attente', couleur: COULEURS.ambre },
  en_retard: { libelle: 'En retard', couleur: COULEURS.brique },
  annulee: { libelle: 'Annulées', couleur: COULEURS.gris },
};

const PALETTE_CLIENTS = [
  COULEURS.outremer,
  COULEURS.nuit,
  COULEURS.bleuTeal,
  COULEURS.lavande,
  COULEURS.gris,
];

function Indicateur({ libelle, valeur, unite, variation, formatVariation = pourcent, hausseBonne = true, note, danger }) {
  let badge = null;
  if (variation !== null && variation !== undefined) {
    const bonne = hausseBonne ? variation >= 0 : variation <= 0;
    const Icone = variation >= 0 ? TrendingUp : TrendingDown;
    badge = (
      <span className={`variation ${bonne ? 'bonne' : 'mauvaise'}`}>
        <Icone size={13} strokeWidth={2.2} />
        {formatVariation(variation)}
      </span>
    );
  }
  return (
    <div className={`d-indicateur${danger ? ' danger' : ''}`}>
      <span className="d-indicateur-libelle">{libelle}</span>
      <strong>
        {valeur}
        {unite && <small>{unite}</small>}
      </strong>
      <div className="d-indicateur-bas">
        {badge}
        <span className="muted">{note}</span>
      </div>
    </div>
  );
}

function FormulaireSolde({ peutModifier, surEnregistre }) {
  const [montant, setMontant] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  if (!peutModifier) {
    return (
      <p className="muted">
        Aucun solde n'est enregistré. Demandez à un gestionnaire de le renseigner.
      </p>
    );
  }

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await api('/tresorerie/solde', { methode: 'POST', corps: { montant: Number(montant) } });
      surEnregistre();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form className="d-solde" onSubmit={soumettre}>
      <h3>Renseignez votre solde actuel</h3>
      <p className="muted">
        C'est le point de départ de la prévision. Vous pourrez le mettre à jour à tout moment.
      </p>
      {erreur && <div className="message-erreur">{erreur}</div>}
      <div className="d-solde-champs">
        <div className="champ">
          <label htmlFor="solde">Solde en caisse et en banque (FCFA)</label>
          <input
            id="solde"
            type="number"
            inputMode="decimal"
            required
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
          />
        </div>
        <button className="bouton bouton-principal" disabled={envoi || montant === ''}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

export default function DashboardPage() {
  const { utilisateur, peutModifier } = useAuth();
  const [scenario, setScenario] = useState('prudent');
  const synthese = useApi('/dashboard');
  const projection = useApi(`/tresorerie/projection?scenario=${scenario}`);

  const s = synthese.donnees;
  const p = projection.donnees;
  const prenom = utilisateur.nom.split(' ')[0];

  // Un point par jour sur 90 jours (le solde change aux dates des événements)
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

  // Entrées et sorties regroupées par semaine (13 semaines)
  const flux = useMemo(() => {
    if (!p) return [];
    const debut = new Date(`${p.aujourdhui}T00:00:00Z`);
    const semaines = Array.from({ length: 13 }, (_, i) => {
      const d = new Date(debut);
      d.setUTCDate(d.getUTCDate() + i * 7);
      return { libelle: dateCourte(d.toISOString().slice(0, 10)), encaissements: 0, depenses: 0 };
    });
    p.evenements.forEach((e) => {
      const jours = Math.floor((new Date(`${e.date}T00:00:00Z`) - debut) / 86400000);
      const i = Math.min(12, Math.max(0, Math.floor(jours / 7)));
      if (e.montant >= 0) semaines[i].encaissements += e.montant;
      else semaines[i].depenses += -e.montant;
    });
    return semaines;
  }, [p]);

  const statuts = useMemo(
    () =>
      (s?.statuts ?? [])
        .filter((x) => x.nb > 0 && STATUTS[x.statut])
        .map((x) => ({ ...STATUTS[x.statut], statut: x.statut, nb: x.nb })),
    [s]
  );
  const totalFactures = statuts.reduce((somme, x) => somme + x.nb, 0);

  const creances = useMemo(
    () =>
      (s?.creances ?? []).map((c, i) => ({
        ...c,
        couleur: PALETTE_CLIENTS[i % PALETTE_CLIENTS.length],
      })),
    [s]
  );

  const sansSolde = projection.erreur?.statut === 409;

  return (
    <div>
      <div className="entete-page">
        <div>
          <h1>Bonjour {prenom}</h1>
          <p className="muted">
            {s ? dateLongue(s.aujourdhui) : utilisateur.entreprise.nom}
          </p>
        </div>
        {peutModifier && (
          <div className="d-actions">
            <Link to="/app/clients" className="bouton bouton-secondaire">
              <UserPlus size={17} strokeWidth={1.8} />
              Ajouter un client
            </Link>
            <Link to="/app/factures" className="bouton bouton-principal">
              <Plus size={17} strokeWidth={2} />
              Nouvelle facture
            </Link>
          </div>
        )}
      </div>

      {synthese.erreur && (
        <div className="message-erreur">
          Impossible de charger les indicateurs : {synthese.erreur.message}
        </div>
      )}

      <div className="d-grille-kpi">
        {s ? (
          <>
            <Indicateur
              libelle="À encaisser"
              valeur={nombreFr(s.aEncaisser.montant)}
              unite="FCFA"
              variation={s.aEncaisser.variation}
              note={pluriel(s.aEncaisser.nbFactures, 'facture')}
            />
            <Indicateur
              libelle="En retard"
              valeur={nombreFr(s.enRetard.montant)}
              unite="FCFA"
              variation={s.enRetard.variation}
              hausseBonne={false}
              danger={s.enRetard.montant > 0}
              note={pluriel(s.enRetard.nbFactures, 'facture')}
            />
            <Indicateur
              libelle="Encaissé ce mois"
              valeur={nombreFr(s.encaisse.montant)}
              unite="FCFA"
              variation={s.encaisse.variation}
              note="par rapport au mois dernier"
            />
            <Indicateur
              libelle="Taux de recouvrement"
              valeur={s.recouvrement.taux === null ? '—' : `${s.recouvrement.taux} %`}
              variation={s.recouvrement.variation}
              formatVariation={points}
              note="des factures échues"
            />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <div key={i} className="d-indicateur squelette" />)
        )}
      </div>

      <div className="d-grille">
        <section className="d-carte d-tresorerie">
          <header className="d-carte-entete">
            <div>
              <h2>Trésorerie prévue</h2>
              <p className="muted">Solde projeté sur 90 jours</p>
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
                >
                  {libelle}
                </button>
              ))}
            </div>
          </header>

          {sansSolde ? (
            <FormulaireSolde peutModifier={peutModifier} surEnregistre={projection.recharger} />
          ) : projection.erreur ? (
            <div className="message-erreur">{projection.erreur.message}</div>
          ) : p ? (
            <>
              {p.alertes.length > 0 ? (
                <div className="d-alerte">
                  <TriangleAlert size={17} strokeWidth={2} />
                  <span>{p.alertes[0]}</span>
                </div>
              ) : (
                <div className="d-alerte ok">Aucun découvert prévu sur 90 jours.</div>
              )}
              <div className="d-zone d-zone-haute">
                <CourbeTresorerie serie={serie} />
              </div>
              <div className="d-horizons">
                {p.horizons.map((h) => (
                  <div className="d-horizon" key={h.jours}>
                    <span>Dans {h.jours} jours</span>
                    <strong className={h.soldePrevu < 0 ? 'negatif' : ''}>{fcfa(h.soldePrevu)}</strong>
                  </div>
                ))}
              </div>
              <p className="d-note muted">
                {scenario === 'prudent'
                  ? 'Scénario prudent : les factures en retard ne sont pas comptées.'
                  : 'Scénario probable : les factures en retard sont supposées payées sous 15 jours.'}
              </p>
            </>
          ) : (
            <div className="d-zone squelette" />
          )}
        </section>

        <section className="d-carte d-creances">
          <header className="d-carte-entete">
            <div>
              <h2>Créances par client</h2>
              <p className="muted">Ce que chaque client vous doit</p>
            </div>
          </header>
          {creances.length > 0 ? (
            <div className="d-zone d-zone-haute">
              <BarresClients donnees={creances} />
            </div>
          ) : (
            <p className="d-vide muted">
              {s ? 'Aucune créance en cours.' : 'Chargement…'}
            </p>
          )}
        </section>

        <section className="d-carte d-repartition">
          <header className="d-carte-entete">
            <div>
              <h2>Répartition des factures</h2>
              <p className="muted">Par statut</p>
            </div>
          </header>
          {totalFactures > 0 ? (
            <>
              <div className="d-donut">
                <RepartitionDonut donnees={statuts} />
                <div className="d-donut-centre">
                  <strong>{totalFactures}</strong>
                  <span>{totalFactures > 1 ? 'factures' : 'facture'}</span>
                </div>
              </div>
              <ul className="d-legende">
                {statuts.map((x) => (
                  <li key={x.statut}>
                    <i style={{ background: x.couleur }} />
                    <span>{x.libelle}</span>
                    <b>{Math.round((x.nb / totalFactures) * 100)} %</b>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="d-vide muted">{s ? 'Aucune facture pour le moment.' : 'Chargement…'}</p>
          )}
        </section>

        <section className="d-carte d-flux">
          <header className="d-carte-entete">
            <div>
              <h2>Entrées et sorties par semaine</h2>
              <p className="muted">Prévisions sur 13 semaines</p>
            </div>
            <div className="d-legende-ligne">
              <span><i style={{ background: COULEURS.outremer }} />Encaissements</span>
              <span><i style={{ background: COULEURS.nuit }} />Dépenses</span>
            </div>
          </header>
          {p ? (
            <div className="d-zone">
              <FluxHebdo donnees={flux} />
            </div>
          ) : (
            <p className="d-vide muted">
              {sansSolde ? 'Renseignez votre solde pour voir les prévisions.' : 'Chargement…'}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}