export default (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ erreur: err.errors.map((e) => e.message) });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res
      .status(409)
      .json({ erreur: 'Suppression impossible : ces données sont utilisées ailleurs' });
  }
  const statut = err.statut || 500;
  if (statut === 500) console.error(err);
  res
    .status(statut)
    .json({ erreur: statut === 500 ? 'Erreur serveur' : err.message });
};