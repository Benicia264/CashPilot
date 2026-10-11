import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import RegleRelance from '../models/regleRelanceModel.js';
import Relance from '../models/relanceModel.js';

const requeter = (sql, replacements = {}) =>
  sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

// ---------- Règles ----------
export const trouverRegles = (entrepriseId) =>
  RegleRelance.findAll({ where: { entrepriseId }, order: [['joursRetard', 'ASC']] });

export const trouverRegleParId = (id, entrepriseId) =>
  RegleRelance.findOne({ where: { id, entrepriseId } });

export const creerRegle = (donnees) => RegleRelance.create(donnees);
export const modifierRegle = (regle, donnees) => regle.update(donnees);
export const supprimerRegle = (regle) => regle.destroy();

// ---------- Moteur ----------
export const entreprisesIds = async () =>
  (await requeter('SELECT id FROM entreprises ORDER BY id')).map((e) => e.id);

// Pour chaque facture en retard : la règle la PLUS ÉLEVÉE atteinte
// (DISTINCT ON), puis on écarte celles déjà traitées (NOT EXISTS)
export const relancesADeclencher = (entrepriseId) =>
  requeter(
    `SELECT * FROM (
       SELECT DISTINCT ON (v.id)
         v.id AS facture_id, v.numero, v.reste_a_payer,
         v.date_echeance::text AS date_echeance, v.jours_retard,
         c.nom AS client_nom, c.email, c.telephone, c.canal_prefere,
         e.nom AS entreprise_nom,
         r.id AS regle_id, r.message AS modele
       FROM v_factures_statut v
       JOIN clients c ON c.id = v.client_id
       JOIN entreprises e ON e.id = v.entreprise_id
       JOIN regles_relance r
         ON r.entreprise_id = v.entreprise_id
        AND r.actif
        AND r.jours_retard <= v.jours_retard
       WHERE v.entreprise_id = :eid AND v.statut = 'en_retard'
       ORDER BY v.id, r.jours_retard DESC
     ) a
     WHERE NOT EXISTS (
       SELECT 1 FROM relances rel
       WHERE rel.facture_id = a.facture_id AND rel.regle_id = a.regle_id
     )
     ORDER BY a.jours_retard DESC`,
    { eid: entrepriseId }
  );

// ---------- Historique ----------
export const creerRelance = (donnees) => Relance.create(donnees);

export const mettreAJourRelance = (id, donnees) =>
  Relance.update(donnees, { where: { id } });

export const listerRelances = (entrepriseId, statut) =>
  requeter(
    `SELECT r.id, r.statut, r.canal, r.message, r.erreur, r.created_at, r.envoyee_le,
            f.numero, c.nom AS client, c.telephone, rg.jours_retard AS regle
     FROM relances r
     JOIN factures f ON f.id = r.facture_id
     JOIN clients c ON c.id = f.client_id
     LEFT JOIN regles_relance rg ON rg.id = r.regle_id
     WHERE f.entreprise_id = :eid ${statut ? 'AND r.statut = :statut' : ''}
     ORDER BY r.created_at DESC, r.id DESC`,
    { eid: entrepriseId, ...(statut && { statut }) }
  );

export const trouverDetail = async (id, entrepriseId) => {
  const [ligne] = await requeter(
    `SELECT r.id, r.statut, r.canal, r.message, f.numero, c.email, c.telephone
     FROM relances r
     JOIN factures f ON f.id = r.facture_id
     JOIN clients c ON c.id = f.client_id
     WHERE r.id = :id AND f.entreprise_id = :eid`,
    { id, eid: entrepriseId }
  );
  return ligne;
};