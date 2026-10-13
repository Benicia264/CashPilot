import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';

const requeter = (sql, replacements = {}) =>
  sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

export const reperesDates = async () => {
  const [ligne] = await requeter(
    `SELECT CURRENT_DATE::text AS aujourdhui,
            (date_trunc('month', CURRENT_DATE) - interval '1 day')::date::text AS fin_mois_precedent`
  );
  return ligne;
};

// Photographie des créances à une date donnée (sert à comparer avec le mois dernier)
export const etatAuJour = async (entrepriseId, jour) => {
  const [ligne] = await requeter(
    `WITH etat AS (
       SELECT f.montant, f.date_echeance,
              COALESCE((SELECT SUM(p.montant) FROM paiements p
                        WHERE p.facture_id = f.id AND p.date_paiement <= :jour), 0) AS paye
       FROM factures f
       WHERE f.entreprise_id = :eid AND NOT f.annulee AND f.date_emission <= :jour
     )
     SELECT
       COALESCE(SUM(montant - paye) FILTER (WHERE montant > paye), 0) AS a_encaisser,
       COUNT(*) FILTER (WHERE montant > paye) AS nb_a_encaisser,
       COALESCE(SUM(montant - paye) FILTER (WHERE montant > paye AND date_echeance < :jour), 0) AS en_retard,
       COUNT(*) FILTER (WHERE montant > paye AND date_echeance < :jour) AS nb_en_retard,
       COALESCE(SUM(paye) FILTER (WHERE date_echeance <= :jour), 0) AS paye_echu,
       COALESCE(SUM(montant) FILTER (WHERE date_echeance <= :jour), 0) AS montant_echu
     FROM etat`,
    { eid: entrepriseId, jour }
  );
  return ligne;
};

export const encaissements = async (entrepriseId) => {
  const [ligne] = await requeter(
    `SELECT
       COALESCE(SUM(p.montant) FILTER (
         WHERE p.date_paiement >= date_trunc('month', CURRENT_DATE)), 0) AS ce_mois,
       COALESCE(SUM(p.montant) FILTER (
         WHERE p.date_paiement >= date_trunc('month', CURRENT_DATE) - interval '1 month'
           AND p.date_paiement <  date_trunc('month', CURRENT_DATE)), 0) AS mois_precedent
     FROM paiements p
     JOIN factures f ON f.id = p.facture_id
     WHERE f.entreprise_id = :eid`,
    { eid: entrepriseId }
  );
  return ligne;
};

export const statuts = (entrepriseId) =>
  requeter(
    `SELECT statut, COUNT(*) AS nb
     FROM v_factures_statut
     WHERE entreprise_id = :eid
     GROUP BY statut`,
    { eid: entrepriseId }
  );

export const creancesParClient = (entrepriseId) =>
  requeter(
    `SELECT nom, total_du
     FROM v_creances_par_client
     WHERE entreprise_id = :eid
     ORDER BY total_du DESC`,
    { eid: entrepriseId }
  );