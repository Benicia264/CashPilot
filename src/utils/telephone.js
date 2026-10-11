// Convertit un numéro saisi librement en chiffres au format international,
// comme l'exige le lien wa.me (sans + ni espaces)
export const versInternational = (telephone) => {
  if (!telephone) return null;

  const brut = telephone.trim();
  const chiffres = brut.replace(/\D/g, '');
  if (!chiffres) return null;

  let resultat;
  if (brut.startsWith('+')) resultat = chiffres; // +242 06 123 4567
  else if (chiffres.startsWith('00')) resultat = chiffres.slice(2); // 00242...
  else resultat = (process.env.INDICATIF_PAYS || '') + chiffres; // numéro local

  return resultat.length >= 8 ? resultat : null;
};