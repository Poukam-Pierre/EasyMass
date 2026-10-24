import { MailMessage } from '../mail/mail.service';

/** The account-setup email, in both platform languages at once — it's sent
 * before the recipient has ever logged in, so there's no language
 * preference of theirs to pick from yet. */
export function buildAccountSetupEmail(
  to: string,
  setupUrl: string,
  validityHours: number
): MailMessage {
  const fr = {
    intro:
      'Un compte EasyMesse a été créé pour votre paroisse. Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail et choisir votre mot de passe :',
    action: 'Activer mon compte',
    expiry: `Ce lien est valable ${validityHours} heures et ne peut être utilisé qu'une seule fois.`,
    ignore:
      "Si vous n'attendiez pas ce message, vous pouvez l'ignorer.",
  };
  const en = {
    intro:
      'An EasyMesse account has been created for your parish. Click the link below to confirm your email address and choose your password:',
    action: 'Activate my account',
    expiry: `This link is valid for ${validityHours} hours and can only be used once.`,
    ignore: "If you weren't expecting this email, you can ignore it.",
  };

  const textSection = (copy: typeof fr) =>
    [copy.intro, setupUrl, copy.expiry, copy.ignore].join('\n\n');
  const htmlSection = (copy: typeof fr) => `
    <p>${copy.intro}</p>
    <p><a href="${setupUrl}" style="display:inline-block;padding:10px 18px;background:#026da9;color:#ffffff;border-radius:6px;text-decoration:none">${copy.action}</a></p>
    <p style="color:#555555;font-size:13px">${copy.expiry}<br>${copy.ignore}</p>`;

  return {
    to,
    subject: 'Activez votre compte EasyMesse / Activate your EasyMesse account',
    text: `${textSection(fr)}\n\n----------\n\n${textSection(en)}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px">
    ${htmlSection(fr)}
    <hr style="border:none;border-top:1px solid #dddddd;margin:24px 0">
    ${htmlSection(en)}
  </div>`,
  };
}
