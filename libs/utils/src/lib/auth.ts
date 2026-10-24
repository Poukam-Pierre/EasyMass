/**
 * The account password rule, mirroring the backend's IsAccountPassword
 * (apps/backend/src/common/account-password.ts): at least 10 characters
 * with a lowercase letter, an uppercase letter, a digit and a symbol.
 * Change both together.
 */
export const ACCOUNT_PASSWORD_PATTERN =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

/** Login refusals the backend reports as an i18n key rather than text —
 * shared by every app's login (pass to extractApiErrorKey). */
export const LOGIN_ERROR_KEYS = new Set(['emailNotVerified', 'tooManyAttempts']);

/** What every app's AuthContext.login resolves to — `messageId` is set
 * when the refusal is one of LOGIN_ERROR_KEYS, for the page to translate. */
export type LoginResult =
  | { ok: true }
  | { ok: false; message: string; messageId?: string };
