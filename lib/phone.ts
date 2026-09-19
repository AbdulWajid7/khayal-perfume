const PK_MOBILE_REGEX = /^(\+?92|0)?3\d{9}$/;

export function isValidPakistaniMobile(phone: string): boolean {
  const digits = phone.replace(/[\s\-()]/g, "").trim();
  return PK_MOBILE_REGEX.test(digits);
}

export function normalizePhone(phone: string): { local: string; e164: string; isValid: boolean } {
  const digits = phone.replace(/[\s\-()]/g, "").trim();
  if (!PK_MOBILE_REGEX.test(digits)) {
    return { local: digits, e164: digits, isValid: false };
  }
  let local = digits;
  if (local.startsWith("+92")) {
    local = "0" + local.slice(3);
  } else if (local.startsWith("92") && local.length === 12) {
    local = "0" + local.slice(2);
  }
  const e164 = "+92" + local.slice(1);
  return { local, e164, isValid: true };
}
