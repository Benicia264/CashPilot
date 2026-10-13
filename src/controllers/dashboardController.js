import * as dashboardService from '../services/dashboardService.js';

export const synthese = async (req, res, next) => {
  try {
    res.json(await dashboardService.synthese(req.entrepriseId));
  } catch (e) {
    next(e);
  }
};