const separateur = new Intl.NumberFormat('fr-FR');

export const nombreFr = (v) => separateur.format(Math.round(Number(v) || 0));
export const fcfa = (v) => `${nombreFr(v)} FCFA`;
export const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

// 1 250 000 devient « 1,3 M », 250 000 devient « 250 k »
export const abrege = (v) => {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1e6) {
    return `${(n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M`;
  }
  if (Math.abs(n) >= 1e3) return `${Math.round(n / 1e3)} k`;
  return String(n);
};

const enDate = (iso) => new Date(`${iso}T00:00:00`);

export const dateCourte = (iso) =>
  enDate(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

export const dateLongue = (iso) => {
  const texte = enDate(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return texte.charAt(0).toUpperCase() + texte.slice(1);
};

const signe = (v) => (v > 0 ? '+' : v < 0 ? '−' : '');
const absolu = (v) => Math.abs(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 });

export const pourcent = (v) => `${signe(v)}${absolu(v)} %`;
export const points = (v) => `${signe(v)}${absolu(v)} pts`;