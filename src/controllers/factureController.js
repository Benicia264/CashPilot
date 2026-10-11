import * as factureService from '../services/factureService.js';

export const lister = async (req, res, next) => {
  try {
    res.json(await factureService.lister(req.entrepriseId, req.query.statut));
  } catch (e) {
    next(e);
  }
};

export const obtenir = async (req, res, next) => {
  try {
    res.json(await factureService.obtenir(req.params.id, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const creer = async (req, res, next) => {
  try {
    const facture = await factureService.creer(req.body, req.entrepriseId);
    res.status(201).json(facture);
  } catch (e) {
    next(e);
  }
};

export const modifier = async (req, res, next) => {
  try {
    res.json(await factureService.modifier(req.params.id, req.body, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const annuler = async (req, res, next) => {
  try {
    res.json(await factureService.annuler(req.params.id, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};