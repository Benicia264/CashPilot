import * as userService from '../services/userService.js';

export const lister = async (req, res, next) => {
  try {
    res.json(await userService.lister(req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const creer = async (req, res, next) => {
  try {
    res.status(201).json(await userService.creer(req.body, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const modifier = async (req, res, next) => {
  try {
    res.json(await userService.modifier(req.params.id, req.body, req.user));
  } catch (e) {
    next(e);
  }
};