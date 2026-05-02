// Tiny demo password hashing — NOT real cryptography.
// UniRab runs entirely on-device with AsyncStorage; no server is contacted.
export function demoHashPassword(password: string): string {
  let h = 5381;
  for (let i = 0; i < password.length; i++) {
    h = ((h << 5) + h + password.charCodeAt(i)) | 0;
  }
  return `dh_${(h >>> 0).toString(16)}_${password.length}`;
}

export function verifyDemoPassword(password: string, hash: string): boolean {
  return demoHashPassword(password) === hash;
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
