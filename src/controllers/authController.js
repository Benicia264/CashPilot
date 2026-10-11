import * as authService from '../services/authService.js';

export const inscrire = async (req, res, next) => {
  try {
    res.status(201).json(await authService.inscrire(req.body));
  } catch (e) {
    next(e);
  }
};

export const connecter = async (req, res, next) => {
  try {
    res.json(await authService.connecter(req.body));
  } catch (e) {
    next(e);
  }
};

export const moi = async (req, res, next) => {
  try {
    res.json(await authService.moi(req.user.id));
  } catch (e) {
    next(e);
  }
};