import { of } from 'rxjs'
import { emitOnConnect } from './socket-helpers'

export function subscribeToStock (isin) {
  return emitOnConnect(of(JSON.stringify({ subscribe: isin })))
}

export function unsubscribeFromStock (isin) {
  return emitOnConnect(of(JSON.stringify({ unsubscribe: isin })))
}
