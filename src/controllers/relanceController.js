import * as relanceService from '../services/relanceService.js';

export const listerRegles = async (req, res, next) => {
  try {
    res.json(await relanceService.listerRegles(req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const creerRegle = async (req, res, next) => {
  try {
    const regle = await relanceService.creerRegle(req.body, req.entrepriseId);
    res.status(201).json(regle);
  } catch (e) {
    next(e);
  }
};

export const modifierRegle = async (req, res, next) => {
  try {
    res.json(await relanceService.modifierRegle(req.params.id, req.body, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const supprimerRegle = async (req, res, next) => {
  try {
    await relanceService.supprimerRegle(req.params.id, req.entrepriseId);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const lister = async (req, res, next) => {
  try {
    res.json(await relanceService.lister(req.entrepriseId, req.query.statut));
  } catch (e) {
    next(e);
  }
};

export const executer = async (req, res, next) => {
  try {
    res.json(await relanceService.executer(req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const marquerEnvoyee = async (req, res, next) => {
  try {
    res.json(await relanceService.marquerEnvoyee(req.params.id, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const renvoyer = async (req, res, next) => {
  try {
    res.json(await relanceService.renvoyer(req.params.id, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};