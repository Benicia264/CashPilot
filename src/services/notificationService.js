import nodemailer from 'nodemailer';
import { versInternational } from '../utils/telephone.js';

let transporteurPromise;

const creerTransporteur = async () => {
  // Vrai serveur d'envoi si SMTP_HOST est défini dans .env
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    return {
      transporteur: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      }),
      expediteur: process.env.SMTP_FROM || process.env.SMTP_USER,
      test: false,
    };
  }

  // Sinon : faux serveur Ethereal (aucun email réel n'est envoyé)
  const compte = await nodemailer.createTestAccount();
  return {
    transporteur: nodemailer.createTransport({
      host: compte.smtp.host,
      port: compte.smtp.port,
      secure: compte.smtp.secure,
      auth: { user: compte.user, pass: compte.pass },
    }),
    expediteur: 'CashPilot <no-reply@cashpilot.test>',
    test: true,
  };
};

const obtenirTransporteur = () => {
  transporteurPromise ??= creerTransporteur().catch((e) => {
    transporteurPromise = undefined; // permet de réessayer plus tard
    throw e;
  });
  return transporteurPromise;
};

// Renvoie une explication si le client ne peut pas être joint par ce canal
export const contactManquant = (client, canal) => {
  if (canal === 'email' && !client.email) return 'Email manquant';
  if (canal === 'whatsapp' && !versInternational(client.telephone)) {
    return 'Numéro WhatsApp manquant ou invalide';
  }
  if (canal === 'sms') return "Le canal SMS n'est pas encore disponible";
  return null;
};

export const lienWhatsApp = (telephone, message) => {
  const numero = versInternational(telephone);
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(message)}` : null;
};

const envoyerEmail = async ({ email, sujet, message }) => {
  const { transporteur, expediteur, test } = await obtenirTransporteur();
  const info = await transporteur.sendMail({
    from: expediteur,
    to: email,
    subject: sujet,
    text: message,
  });
  return { apercu: test ? nodemailer.getTestMessageUrl(info) : null };
};

// Point d'entrée unique : le moteur de relances ne connaît pas les détails des canaux
export const notifier = async ({ canal, client, sujet, message }) => {
  if (canal === 'email') {
    const { apercu } = await envoyerEmail({ email: client.email, sujet, message });
    return { statut: 'envoyee', apercu };
  }
  if (canal === 'whatsapp') {
    return { statut: 'a_envoyer', lien: lienWhatsApp(client.telephone, message) };
  }
  throw new Error(`Canal non géré : ${canal}`);
};