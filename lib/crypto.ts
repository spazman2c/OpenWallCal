import { createHash, randomBytes } from 'crypto';

export function makeToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function makePairingCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
