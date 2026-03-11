import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import styles from './ActionsDropdown.module.css';

/* ─── helpers ─── */
const mailto = (to, subject, body) => {
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);
  window.location.href = `mailto:${to}?subject=${s}&body=${b}`;
};

const fmt = (tpl, vars) =>
  Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{${k}}`, v || ''), tpl);

/* ─── inform-templates ─── */
const INFORM_TEMPLATES = [
  { id: 'dossier', label: 'Dossier in behandeling',
    body: 'Beste {speler},\n\nBedankt voor je inzet. We willen je laten weten dat je dossier momenteel in behandeling is bij onze scoutingafdeling. We nemen zo snel mogelijk contact met je op voor een volgende stap.\n\nSportieve groeten,\n{scout}' },
  { id: 'opvolging', label: 'We volgen je op',
    body: 'Beste {speler},\n\nGoed nieuws: je staat op onze opvolglijst. We zullen je de komende weken en maanden extra in de gaten houden. Blijf doen wat je doet!\n\nSportieve groeten,\n{scout}' },
  { id: 'succes', label: 'Succes gewenst',
    body: 'Beste {speler},\n\nBedankt dat je jezelf hebt laten zien. We wensen je heel veel succes in je verdere voetbalcarri\u00E8re. Wie weet kruisen onze paden opnieuw.\n\nSportieve groeten,\n{scout}' },
];

/* ─── rejection template ─── */
const REJECTION_BODY = 'Beste {speler},\n\nBedankt voor je inzet en de tijd die je hebt ge\u00EFnvesteerd. Na zorgvuldige evaluatie door onze scoutingafdeling zijn we tot de conclusie gekomen dat we op dit moment niet verder gaan met je profiel.\n\nDit zegt niets over je kwaliteiten als voetballer. We moedigen je aan om hard te blijven werken en je doelen na te streven.\n\n{persoonlijk}Sportieve groeten,\n{scout}';

/* ─── parent template ─── */
const PARENT_BODY = 'Beste {ouder},\n\nIk contacteer u als scout van Scout4All in verband met {speler}. Graag zou ik u enkele vragen stellen en uw terugkoppeling ontvangen over het verloop van het traject.\n\nKunt u mij laten weten wanneer het u past om hierover te spreken?\n\nMet vriendelijke groeten,\n{scout}';

/* ─── action definitions ─── */
const ACTIONS = [
  { id: 'invite',   icon: '\uD83C\uDFCB\uFE0F', label: 'Speler uitnodigen voor training' },
  { id: 'contact',  icon: '\uD83D\uDCE8',         label: 'Vrijblijvend contacteren' },
  { id: 'inform',   icon: '\u2139\uFE0F',          label: 'Speler informeren' },
  { id: 'forward',  icon: '\uD83D\uDCE4',         label: 'Spelersrapport doormailen' },
  { id: 'reject',   icon: '\uD83E\uDD1D',         label: 'Afwijzing met respect' },
  { id: 'parent',   icon: '\uD83D\uDC68\u200D\uD83D\uDC66', label: 'Terugkoppeling vragen aan ouders' },
];

/* ────────────────────────────────────────────────── */
/*  MODAL FORMS                                       */
/* ────────────────────────────────────────────────── */

const ModalField = ({ label, children }) => (
  <div className={styles.field}>
    <label className={styles.fieldLabel}>{label}</label>
    {children}
  </div>
);

/* 1 ─ Invite */
const InviteForm = ({ player, scoutUser, onClose }) => {
  const [datum, setDatum] = useState('');
  const [tijdVan, setTijdVan] = useState('');
  const [tijdTot, setTijdTot] = useState('');
  const [locatie, setLocatie] = useState('');
  const club = scoutUser?.club_name || scoutUser?.organisation || '';

  const send = () => {
    const name = `${player.first_name} ${player.last_name}`;
    const subject = `Uitnodiging kennismakingstraining \u2013 ${club}`;
    const body = `Beste ${name},\n\nGraag nodigen wij je uit voor een kennismakingstraining bij ${club}.\n\nDatum: ${datum}\nTijdstip: ${tijdVan} \u2013 ${tijdTot}\nLocatie: ${locatie}\n\nGelieve je aanwezigheid te bevestigen door op deze e-mail te antwoorden.\n\nSportieve groeten,\n${scoutUser?.full_name || scoutUser?.first_name || 'Scout'}\n${club}`;
    mailto(player.email || '', subject, body);
    onClose();
  };

  return (
    <>
      <ModalField label="Datum">
        <input type="date" className={styles.input} value={datum} onChange={e => setDatum(e.target.value)} />
      </ModalField>
      <ModalField label="Tijdstip van">
        <input type="time" className={styles.input} value={tijdVan} onChange={e => setTijdVan(e.target.value)} />
      </ModalField>
      <ModalField label="Tijdstip tot">
        <input type="time" className={styles.input} value={tijdTot} onChange={e => setTijdTot(e.target.value)} />
      </ModalField>
      <ModalField label="Locatie">
        <input type="text" className={styles.input} placeholder="Sportcomplex, adres\u2026" value={locatie} onChange={e => setLocatie(e.target.value)} />
      </ModalField>
      <ModalField label="Club">
        <input type="text" className={styles.input} value={club} readOnly />
      </ModalField>
      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={onClose}>Annuleren</button>
        <button className={styles.btnPrimary} onClick={send}>Open e-mail</button>
      </div>
    </>
  );
};

/* 2 ─ Contact */
const ContactForm = ({ player, scoutUser, onClose }) => {
  const [bericht, setBericht] = useState('');

  const send = () => {
    const name = `${player.first_name} ${player.last_name}`;
    const body = `Beste ${name},\n\n${bericht}\n\nMet sportieve groeten,\n${scoutUser?.full_name || scoutUser?.first_name || 'Scout'}`;
    mailto(player.email || '', 'Contact via Scout4All', body);
    onClose();
  };

  return (
    <>
      <ModalField label="Bericht">
        <textarea className={styles.textarea} rows={5} placeholder="Typ je bericht\u2026" value={bericht} onChange={e => setBericht(e.target.value)} />
      </ModalField>
      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={onClose}>Annuleren</button>
        <button className={styles.btnPrimary} onClick={send}>Open e-mail</button>
      </div>
    </>
  );
};

/* 3 ─ Inform */
const InformForm = ({ player, scoutUser, onClose }) => {
  const [tplId, setTplId] = useState(INFORM_TEMPLATES[0].id);
  const [extra, setExtra] = useState('');
  const scoutName = scoutUser?.full_name || scoutUser?.first_name || 'Scout';
  const playerName = `${player.first_name} ${player.last_name}`;

  const send = () => {
    const tpl = INFORM_TEMPLATES.find(t => t.id === tplId);
    let body = fmt(tpl.body, { speler: playerName, scout: scoutName });
    if (extra) body += `\n\nPS: ${extra}`;
    mailto(player.email || '', `${tpl.label} \u2013 Scout4All`, body);
    onClose();
  };

  return (
    <>
      <ModalField label="Template">
        <select className={styles.select} value={tplId} onChange={e => setTplId(e.target.value)}>
          {INFORM_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </ModalField>
      <ModalField label="Persoonlijk berichtje (optioneel)">
        <textarea className={styles.textarea} rows={3} placeholder="Voeg een persoonlijke noot toe\u2026" value={extra} onChange={e => setExtra(e.target.value)} />
      </ModalField>
      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={onClose}>Annuleren</button>
        <button className={styles.btnPrimary} onClick={send}>Open e-mail</button>
      </div>
    </>
  );
};

/* 4 ─ Forward report */
const ForwardForm = ({ player, scoutUser, onClose }) => {
  const [ontvanger, setOntvanger] = useState('');
  const [tekst, setTekst] = useState('');
  const playerName = `${player.first_name} ${player.last_name}`;
  const scoutName = scoutUser?.full_name || scoutUser?.first_name || 'Scout';

  const send = () => {
    const subject = `Spelersrapport \u2013 ${playerName}`;
    const body = `Beste collega,\n\nHierbij stuur ik het spelersrapport door van ${playerName}.${tekst ? `\n\n${tekst}` : ''}\n\nMet sportieve groeten,\n${scoutName}`;
    mailto(ontvanger, subject, body);
    onClose();
  };

  return (
    <>
      <ModalField label="E-mailadres ontvanger">
        <input type="email" className={styles.input} placeholder="collega@club.be" value={ontvanger} onChange={e => setOntvanger(e.target.value)} />
      </ModalField>
      <ModalField label="Begeleidende tekst (optioneel)">
        <textarea className={styles.textarea} rows={3} placeholder="Extra toelichting\u2026" value={tekst} onChange={e => setTekst(e.target.value)} />
      </ModalField>
      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={onClose}>Annuleren</button>
        <button className={styles.btnPrimary} onClick={send}>Open e-mail</button>
      </div>
    </>
  );
};

/* 5 ─ Rejection */
const RejectForm = ({ player, scoutUser, onClose }) => {
  const [extra, setExtra] = useState('');
  const playerName = `${player.first_name} ${player.last_name}`;
  const scoutName = scoutUser?.full_name || scoutUser?.first_name || 'Scout';

  const send = () => {
    const persoonlijk = extra ? `${extra}\n\n` : '';
    const body = fmt(REJECTION_BODY, { speler: playerName, scout: scoutName, persoonlijk });
    mailto(player.email || '', 'Terugkoppeling Scout4All', body);
    onClose();
  };

  return (
    <>
      <div className={styles.previewBox}>
        <p className={styles.previewLabel}>Standaardtekst (wordt automatisch toegevoegd)</p>
        <p className={styles.previewText}>Professionele afwijzingsbrief met dank voor de inzet en aanmoediging.</p>
      </div>
      <ModalField label="Persoonlijk berichtje (optioneel)">
        <textarea className={styles.textarea} rows={3} placeholder="Voeg een persoonlijke noot toe\u2026" value={extra} onChange={e => setExtra(e.target.value)} />
      </ModalField>
      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={onClose}>Annuleren</button>
        <button className={styles.btnPrimary} onClick={send}>Open e-mail</button>
      </div>
    </>
  );
};

/* 6 ─ Parent feedback */
const ParentForm = ({ player, scoutUser, onClose }) => {
  const [ouderNaam, setOuderNaam] = useState('');
  const [ouderEmail, setOuderEmail] = useState('');
  const playerName = `${player.first_name} ${player.last_name}`;
  const scoutName = scoutUser?.full_name || scoutUser?.first_name || 'Scout';

  const send = () => {
    const body = fmt(PARENT_BODY, { ouder: ouderNaam || 'meneer/mevrouw', speler: playerName, scout: scoutName });
    mailto(ouderEmail, `Terugkoppeling over ${playerName} \u2013 Scout4All`, body);
    onClose();
  };

  return (
    <>
      <ModalField label="Naam ouder / voogd">
        <input type="text" className={styles.input} placeholder="Naam ouder of voogd" value={ouderNaam} onChange={e => setOuderNaam(e.target.value)} />
      </ModalField>
      <ModalField label="E-mailadres ouder / voogd">
        <input type="email" className={styles.input} placeholder="ouder@voorbeeld.be" value={ouderEmail} onChange={e => setOuderEmail(e.target.value)} />
      </ModalField>
      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={onClose}>Annuleren</button>
        <button className={styles.btnPrimary} onClick={send}>Open e-mail</button>
      </div>
    </>
  );
};

const FORMS = { invite: InviteForm, contact: ContactForm, inform: InformForm, forward: ForwardForm, reject: RejectForm, parent: ParentForm };

/* ────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                    */
/* ────────────────────────────────────────────────── */
const ActionsDropdown = ({ player }) => {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);   // action id or null
  const ref = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openModal = (id) => { setOpen(false); setModal(id); };
  const closeModal = () => setModal(null);

  const activeAction = ACTIONS.find(a => a.id === modal);
  const FormComponent = modal ? FORMS[modal] : null;

  return (
    <div className={styles.wrapper} ref={ref}>
      {/* trigger button */}
      <button className={styles.trigger} onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open}>
        Acties <span className={styles.caret}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {/* dropdown menu */}
      {open && (
        <div className={styles.menu} role="menu">
          {ACTIONS.map(a => (
            <button key={a.id} className={styles.menuItem} role="menuitem" onClick={() => openModal(a.id)}>
              <span className={styles.menuIcon}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* modal overlay */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>{activeAction?.icon}</span>
              <h3 className={styles.modalTitle}>{activeAction?.label}</h3>
              <button className={styles.modalClose} onClick={closeModal}>\u2715</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.playerInfo}>
                <span className={styles.playerChip}>
                  {player.first_name} {player.last_name}
                </span>
                {player.email && <span className={styles.emailChip}>{player.email}</span>}
              </div>
              <FormComponent player={player} scoutUser={user} onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;
