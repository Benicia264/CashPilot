import * as clientService from '../services/clientService.js';

export const lister = async (req, res, next) => {
  try {
    res.json(await clientService.lister(req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const obtenir = async (req, res, next) => {
  try {
    res.json(await clientService.obtenir(req.params.id, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const creer = async (req, res, next) => {
  try {
    const client = await clientService.creer(req.body, req.entrepriseId);
    res.status(201).json(client);
  } catch (e) {
    next(e);
  }
};

export const modifier = async (req, res, next) => {
  try {
    const client = await clientService.modifier(
      req.params.id,
      req.body,
      req.entrepriseId
    );
    res.json(client);
  } catch (e) {
    next(e);
  }
};

export const supprimer = async (req, res, next) => {
  try {
    await clientService.supprimer(req.params.id, req.entrepriseId);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};