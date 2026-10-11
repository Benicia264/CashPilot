import * as assistantService from '../services/assistantService.js';

export const poser = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (typeof question !== 'string' || !question.trim() || question.length > 300) {
      return res
        .status(400)
        .json({ erreur: 'Question invalide (texte de 1 à 300 caractères)' });
    }
    res.json(await assistantService.repondre(question, req.entrepriseId));
  } catch (e) {
    next(e);
  }
};

export const questions = (req, res) => {
  res.json(assistantService.listerQuestions());
};