import { get, post } from './async'

export function checkSession() {
  return get('/api/session', 'SESSION');
}
