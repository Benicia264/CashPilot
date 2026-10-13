import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { abrege, dateCourte, fcfa, nombreFr } from '../utils/format.js';

export const COULEURS = {
  outremer: '#4b47e5',
  nuit: '#16165c',
  lavande: '#b9b6f5',
  bleuTeal: '#2a7f9e',
  vert: '#2f7d4f',
  ambre: '#e7b63c',
  brique: '#c8453b',
  gris: '#b8bbc4',
  texte: '#6b6f7a',
  ligne: '#e7e4da',
};

const AXE = { fill: COULEURS.texte, fontSize: 12 };

function Infobulle({ active, payload, label, titre, couleur, valeur = fcfa }) {
  if (!active || !payload?.length) return null;
  const entete = titre ? titre(label) : label;
  return (
    <div className="infobulle">
      {entete ? <div className="infobulle-titre">{entete}</div> : null}
      {payload.map((p) => (
        <div className="infobulle-ligne" key={p.dataKey ?? p.name}>
          <i style={{ background: couleur || p.payload?.couleur || p.color || p.fill }} />
          <span>{p.name}</span>
          <b>{valeur(p.value)}</b>
        </div>
      ))}
    </div>
  );
}

// Courbe du solde prévu : bleue au-dessus de zéro, rouge en dessous
export function CourbeTresorerie({ serie }) {
  const valeurs = serie.map((s) => s.solde);
  const max = Math.max(...valeurs, 0);
  const min = Math.min(...valeurs, 0);
  const coupure = max <= 0 ? 0 : min >= 0 ? 1 : max / (max - min);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={serie} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="d-remplissage" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor={COULEURS.outremer} stopOpacity={0.24} />
            <stop offset={coupure} stopColor={COULEURS.outremer} stopOpacity={0.03} />
            <stop offset={coupure} stopColor={COULEURS.brique} stopOpacity={0.03} />
            <stop offset={1} stopColor={COULEURS.brique} stopOpacity={0.28} />
          </linearGradient>
          <linearGradient id="d-trait" x1="0" y1="0" x2="0" y2="1">
            <stop offset={coupure} stopColor={COULEURS.outremer} />
            <stop offset={coupure} stopColor={COULEURS.brique} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={COULEURS.ligne} />
        <XAxis
          dataKey="date"
          tickFormatter={dateCourte}
          tickLine={false}
          axisLine={false}
          minTickGap={56}
          tick={AXE}
        />
        <YAxis tickFormatter={abrege} tickLine={false} axisLine={false} width={52} tick={AXE} />
        <Tooltip
          content={<Infobulle titre={dateCourte} couleur={COULEURS.outremer} />}
          cursor={{ stroke: COULEURS.nuit, strokeDasharray: '3 3' }}
        />
        <ReferenceLine y={0} stroke="#a7adb8" strokeDasharray="4 4" />
        <Area
          type="stepAfter"
          dataKey="solde"
          name="Solde prévu"
          stroke="url(#d-trait)"
          strokeWidth={2.4}
          fill="url(#d-remplissage)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Créances par client : barres horizontales
export function BarresClients({ donnees }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={donnees} layout="vertical" margin={{ top: 4, right: 76, left: 0, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="nom"
          width={118}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#1b1d24', fontSize: 13 }}
          tickFormatter={(nom) => (nom.length > 15 ? `${nom.slice(0, 14)}…` : nom)}
        />
        <Tooltip
          content={<Infobulle />}
          cursor={{ fill: 'rgba(75,71,229,0.06)' }}
        />
        <Bar
          dataKey="montant"
          name="À encaisser"
          barSize={16}
          radius={[0, 8, 8, 0]}
          label={{ position: 'right', formatter: nombreFr, fill: '#1b1d24', fontSize: 12 }}
        >
          {donnees.map((d) => (
            <Cell key={d.nom} fill={d.couleur} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Répartition des factures par statut : anneau
export function RepartitionDonut({ donnees }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<Infobulle valeur={(v) => `${v} facture${v > 1 ? 's' : ''}`} />} />
        <Pie
          data={donnees}
          dataKey="nb"
          nameKey="libelle"
          innerRadius="64%"
          outerRadius="94%"
          paddingAngle={2}
          stroke="none"
        >
          {donnees.map((d) => (
            <Cell key={d.statut} fill={d.couleur} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// Entrées et sorties prévues, semaine par semaine
export function FluxHebdo({ donnees }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={donnees} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={COULEURS.ligne} />
        <XAxis dataKey="libelle" tickLine={false} axisLine={false} tick={AXE} interval="preserveStartEnd" minTickGap={24} />
        <YAxis tickFormatter={abrege} tickLine={false} axisLine={false} width={52} tick={AXE} />
        <Tooltip
          content={<Infobulle titre={(l) => `Semaine du ${l}`} />}
          cursor={{ fill: 'rgba(75,71,229,0.06)' }}
        />
        <Bar dataKey="encaissements" name="Encaissements" stackId="flux" fill={COULEURS.outremer} />
        <Bar
          dataKey="depenses"
          name="Dépenses"
          stackId="flux"
          fill={COULEURS.nuit}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}