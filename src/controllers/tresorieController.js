import * as tresorerieService from '../services/tresorieService.js';

export const projection = async (req, res, next) => {
  try {
    res.json(await tresorerieService.projeter(req.entrepriseId, req.query.scenario));
  } catch (e) {
    next(e);
  }
};

export const obtenirSolde = async (req, res, next) => {
  try {
    res.json(await tresorerieService.obtenirSolde(req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const enregistrerSolde = async (req, res, next) => {
  try {
    const solde = await tresorerieService.enregistrerSolde(req.body, req.entrepriseId);
    res.status(201).json(solde);
  } catch (e) {
    next(e);
  }
};

export const listerMouvements = async (req, res, next) => {
  try {
    res.json(await tresorerieService.listerMouvements(req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const creerMouvement = async (req, res, next) => {
  try {
    const mouvement = await tresorerieService.creerMouvement(req.body, req.entrepriseId);
    res.status(201).json(mouvement);
  } catch (e) {
    next(e);
  }
};

export const supprimerMouvement = async (req, res, next) => {
  try {
    await tresorerieService.supprimerMouvement(req.params.id, req.entrepriseId);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};