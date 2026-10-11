import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Requêtes SQL fixes : seules les valeurs (:eid, :limite) sont injectées,
// et Sequelize les échappe (aucun risque d'injection SQL)
const requeter = (sql, entrepriseId, extra = {}) =>
  sequelize.query(sql, {
    replacements: { eid: entrepriseId, ...extra },
    type: QueryTypes.SELECT,
  });

// Q1 : qui me doit le plus
export const topDebiteurs = (eid) =>
  requeter(
    `SELECT nom, nb_factures, total_du, retard_max
     FROM v_creances_par_client
     WHERE entreprise_id = :eid
     ORDER BY total_du DESC
     LIMIT 5`,
    eid
  );

// Q2 : total restant à encaisser, dont la part en retard
export const totalCreances = (eid) =>
  requeter(
    `SELECT
       COUNT(*) AS nb_factures,
       COALESCE(SUM(reste_a_payer), 0) AS total,
       COALESCE(SUM(reste_a_payer) FILTER (WHERE statut = 'en_retard'), 0) AS en_retard
     FROM v_factures_statut
     WHERE entreprise_id = :eid AND statut IN ('en_attente', 'en_retard')`,
    eid
  );

// Q3 et Q4 : factures en retard, les plus anciennes d'abord
export const facturesEnRetard = (eid, limite = 20) =>
  requeter(
    `SELECT v.numero, c.nom AS client, v.reste_a_payer, v.jours_retard, v.date_echeance
     FROM v_factures_statut v
     JOIN clients c ON c.id = v.client_id
     WHERE v.entreprise_id = :eid AND v.statut = 'en_retard'
     ORDER BY v.jours_retard DESC, v.reste_a_payer DESC
     LIMIT :limite`,
    eid,
    { limite }
  );

// Q4 : ancienneté par tranches
export const tranchesRetard = (eid) =>
  requeter(
    `SELECT
       CASE
         WHEN jours_retard <= 30 THEN '1 à 30 jours'
         WHEN jours_retard <= 60 THEN '31 à 60 jours'
         WHEN jours_retard <= 90 THEN '61 à 90 jours'
         ELSE 'plus de 90 jours'
       END AS tranche,
       COUNT(*) AS nb_factures,
       SUM(reste_a_payer) AS total
     FROM v_factures_statut
     WHERE entreprise_id = :eid AND statut = 'en_retard'
     GROUP BY 1
     ORDER BY MIN(jours_retard)`,
    eid
  );

// Q5 : attendu ce mois-ci (échéances du mois) et retards des mois précédents
export const encaissementsMois = (eid) =>
  requeter(
    `SELECT
       COALESCE(SUM(reste_a_payer) FILTER (
         WHERE date_echeance >= date_trunc('month', CURRENT_DATE)
           AND date_echeance <  date_trunc('month', CURRENT_DATE) + interval '1 month'
       ), 0) AS attendu_ce_mois,
       COALESCE(SUM(reste_a_payer) FILTER (
         WHERE date_echeance < date_trunc('month', CURRENT_DATE)
       ), 0) AS retards_anterieurs
     FROM v_factures_statut
     WHERE entreprise_id = :eid AND statut IN ('en_attente', 'en_retard')`,
    eid
  );

// Q5 : argent réellement reçu ce mois-ci
export const recuCeMois = (eid) =>
  requeter(
    `SELECT COALESCE(SUM(p.montant), 0) AS recu_ce_mois
     FROM paiements p
     JOIN factures f ON f.id = p.facture_id
     WHERE f.entreprise_id = :eid
       AND p.date_paiement >= date_trunc('month', CURRENT_DATE)
       AND p.date_paiement <  date_trunc('month', CURRENT_DATE) + interval '1 month'`,
    eid
  );

// Q6 : situation de chaque client (payées / partielles / impayées)
export const statutParClient = (eid) =>
  requeter(
    `SELECT
       c.nom,
       COUNT(*) FILTER (WHERE v.statut = 'payee') AS payees,
       COUNT(*) FILTER (WHERE v.statut IN ('en_attente','en_retard') AND v.montant_paye > 0) AS partielles,
       COUNT(*) FILTER (WHERE v.statut IN ('en_attente','en_retard') AND v.montant_paye = 0) AS impayees,
       COALESCE(SUM(v.reste_a_payer) FILTER (WHERE v.statut IN ('en_attente','en_retard')), 0) AS reste
     FROM clients c
     JOIN v_factures_statut v ON v.client_id = c.id
     WHERE c.entreprise_id = :eid AND v.entreprise_id = :eid AND v.statut <> 'annulee'
     GROUP BY c.id, c.nom
     ORDER BY reste DESC, c.nom`,
    eid
  );