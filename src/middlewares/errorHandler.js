export default (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ erreur: err.errors.map((e) => e.message) });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erreur: 'Cette valeur existe déjà (doublon)' });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res
      .status(409)
      .json({ erreur: 'Opération impossible : ces données sont utilisées ailleurs' });
  }
  if (err.original?.code === '22P02') {
    return res.status(400).json({ erreur: 'Valeur invalide dans la requête' });
  }

  if (err.original?.code === 'P0001') {
    // erreur levée par le trigger SQL (dernier filet de sécurité)
    return res.status(409).json({ erreur: err.original.message });
  }
  const statut = err.statut || 500;
  if (statut === 500) console.error(err);
  res
    .status(statut)
    .json({ erreur: statut === 500 ? 'Erreur serveur' : err.message });
};