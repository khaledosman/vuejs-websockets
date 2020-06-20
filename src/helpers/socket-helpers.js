import { of, fromEvent } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import io from 'socket.io-client'
const WS_URL = 'ws://159.89.15.214:8080/'

const socket$ = of(io(WS_URL))

function connect () {
  return socket$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, 'connect')
          .pipe(
            map(() => socket)
          )
      )
    )
}

export function listenOnConnect (event) {
  return connect()
    .pipe(
      switchMap(socket =>
        fromEvent(socket, event)
      )
    )
}

export function emitOnConnect (observable$) {
  return connect()
    .pipe(
      switchMap(socket =>
        observable$
          .pipe(
            map(data => ({ socket, data }))
          )
      )
    )
}

export function disconnect () {
  return connect().pipe(
    map(socket => socket.disconnect())
  )
}
