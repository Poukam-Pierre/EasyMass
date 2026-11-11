import { MailMessage } from '../mail/mail.service';

interface LinkEmailCopy {
  intro: string;
  action: string;
  expiry: string;
  ignore: string;
}

/** A one-link email in both platform languages at once, French first.
 * Both of these emails can reach someone whose language preference was
 * never set (a brand-new account, or one still on the default), so neither
 * picks a single language. */
function bilingualLinkEmail(
  to: string,
  subject: string,
  url: string,
  fr: LinkEmailCopy,
  en: LinkEmailCopy
): MailMessage {
  const textSection = (copy: LinkEmailCopy) =>
    [copy.intro, url, copy.expiry, copy.ignore].join('\n\n');
  const htmlSection = (copy: LinkEmailCopy) => `
    <p>${copy.intro}</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#026da9;color:#ffffff;border-radius:6px;text-decoration:none">${copy.action}</a></p>
    <p style="color:#555555;font-size:13px">${copy.expiry}<br>${copy.ignore}</p>`;

  return {
    to,
    subject,
    text: `${textSection(fr)}\n\n----------\n\n${textSection(en)}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px">
    ${htmlSection(fr)}
    <hr style="border:none;border-top:1px solid #dddddd;margin:24px 0">
    ${htmlSection(en)}
  </div>`,
  };
}

/** Sent when an admin creates a parish account. */
export function buildAccountSetupEmail(
  to: string,
  setupUrl: string,
  validityHours: number
): MailMessage {
  return bilingualLinkEmail(
    to,
    'Activez votre compte EasyMesse / Activate your EasyMesse account',
    setupUrl,
    {
      intro:
        'Un compte EasyMesse a été créé pour votre paroisse. Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail et choisir votre mot de passe :',
      action: 'Activer mon compte',
      expiry: `Ce lien est valable ${validityHours} heures et ne peut être utilisé qu'une seule fois.`,
      ignore: "Si vous n'attendiez pas ce message, vous pouvez l'ignorer.",
    },
    {
      intro:
        'An EasyMesse account has been created for your parish. Click the link below to confirm your email address and choose your password:',
      action: 'Activate my account',
      expiry: `This link is valid for ${validityHours} hours and can only be used once.`,
      ignore: "If you weren't expecting this email, you can ignore it.",
    }
  );
}

/** Sent when the owner asks to reset a forgotten password, or an admin
 * sends a reset link for them. */
export function buildPasswordResetEmail(
  to: string,
  resetUrl: string,
  validityMinutes: number
): MailMessage {
  return bilingualLinkEmail(
    to,
    'Réinitialisez votre mot de passe EasyMesse / Reset your EasyMesse password',
    resetUrl,
    {
      intro:
        'Une réinitialisation du mot de passe de votre compte EasyMesse a été demandée. Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :',
      action: 'Choisir un nouveau mot de passe',
      expiry: `Ce lien est valable ${validityMinutes} minutes et ne peut être utilisé qu'une seule fois.`,
      ignore:
        "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.",
    },
    {
      intro:
        'A password reset was requested for your EasyMesse account. Click the link below to choose a new password:',
      action: 'Choose a new password',
      expiry: `This link is valid for ${validityMinutes} minutes and can only be used once.`,
      ignore:
        "If you didn't ask for this, ignore this email: your current password stays unchanged.",
    }
  );
}
