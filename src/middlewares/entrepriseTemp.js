// TEMPORAIRE : sera remplacé par l'authentification (l'entreprise viendra du token)
export default (req, res, next) => {
  req.entrepriseId = 1;
  next();
};