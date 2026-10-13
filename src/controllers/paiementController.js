import * as paiementService from '../services/paiementService.js';

export const lister = async (req, res, next) => {
  try {
    res.json(await paiementService.lister(req.params.factureId, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const creer = async (req, res, next) => {
  try {
    const resultat = await paiementService.creer(
      req.params.factureId,
      req.body,
      req.entrepriseId
    );
    res.status(201).json(resultat);
  } catch (e) {
    next(e);
  }
};