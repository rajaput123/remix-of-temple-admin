const ACCOUNTS_KEY = "bc-auth-accounts-v1";

export interface BCAuthAccount {
  mobile: string;
  mpin: string;
  businessName: string;
  businessType: string;
  createdAt: string;
}

function loadAccounts(): Record<string, BCAuthAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, BCAuthAccount>) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, BCAuthAccount>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

export function isValidMobile(mobile: string) {
  return /^[6-9]\d{9}$/.test(mobile);
}

export function isValidOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}

export function isValidMpin(mpin: string) {
  return /^\d{4}$/.test(mpin);
}

export function maskMobile(mobile: string) {
  if (mobile.length < 10) return mobile;
  return `+91 ${mobile.slice(0, 2)}****${mobile.slice(-2)}`;
}

export function accountExists(mobile: string) {
  return !!loadAccounts()[mobile];
}

export function registerAccount(data: Omit<BCAuthAccount, "createdAt">) {
  const accounts = loadAccounts();
  accounts[data.mobile] = { ...data, createdAt: new Date().toISOString() };
  saveAccounts(accounts);
}

export function verifyMpin(mobile: string, mpin: string) {
  const account = loadAccounts()[mobile];
  return account?.mpin === mpin;
}

export function getAccount(mobile: string) {
  return loadAccounts()[mobile];
}

export function updateMpin(mobile: string, mpin: string) {
  const accounts = loadAccounts();
  if (!accounts[mobile]) return false;
  accounts[mobile] = { ...accounts[mobile], mpin };
  saveAccounts(accounts);
  return true;
}

/** Demo: any 6-digit OTP is accepted. */
export function demoSendOtp(_mobile: string) {
  return true;
}

export function demoVerifyOtp(otp: string) {
  return isValidOtp(otp);
}
