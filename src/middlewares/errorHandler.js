export default (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ erreur: err.errors.map((e) => e.message) });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erreur: 'Cette valeur existe déjà (numéro de facture en double ?)' });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res
      .status(409)
      .json({ erreur: 'Opération impossible : ces données sont utilisées ailleurs' });
  }
  if (err.original?.code === '22P02') {
    return res.status(400).json({ erreur: 'Valeur invalide dans la requête' });
  }
  const statut = err.statut || 500;
  if (statut === 500) console.error(err);
  res
    .status(statut)
    .json({ erreur: statut === 500 ? 'Erreur serveur' : err.message });
};