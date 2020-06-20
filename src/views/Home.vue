<template>
  <div class="home">
    <h3>Status: {{state}}</h3>
    <select id="isins" name="isins" v-model="selected" @change="handleChange">
      <option v-for="isin in isins" :key="isin" :selected="isin === selected" :value="isin">{{isin}}</option>
    </select>
    <button @click="destroy">Disconnect</button>
    <button @click="init">Connect</button>
    <section>
      <StockView v-if="currentStock" :stock="currentStock"></StockView>
    </section>
  </div>
</template>

<script>
import {
  subscribeToStock,
  unsubscribeFromStock
} from "../helpers/stock-helpers";
import { of, fromEvent, from, Subject, Observable } from "rxjs";
import {
  switchMap,
  map,
  tap,
  takeUntil,
  share,
  catchError
} from "rxjs/operators";
import { connect } from "../helpers/socket-helpers";
import StockView from "../components/StockView";
function send(socket, payload) {
  return socket.send(JSON.stringify(payload));
}

function unsubscribeFromISIN(socket, isin) {
  return send(socket, { unsubscribe: isin });
}

function subscribeToISIN(socket, isin) {
  return send(socket, { subscribe: isin });
}
const completeSubscription = new Subject();

export default {
  name: "Home",
  components: {
    StockView
  },
  data() {
    return {
      state: "disconnected",
      socket: null,
      isins: ["DE000BASF111", "DE0008469008", "EU0009652759"],
      selected: "DE000BASF111",
      currentStock: null,
      timderId: null
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      of(new WebSocket("ws://159.89.15.214:8080/"))
        .pipe(
          switchMap(socket => {
            // wait until connection is open
            return from(
              new Promise((resolve, reject) => {
                socket.onopen = event => {
                  if (this.timerID) {
                    window.clearInterval(this.timerID);
                    this.timerID = null;
                  }
                  resolve(socket);
                };
                socket.onerror = error => {
                  this.state = "error";
                  reject(error);
                };

                socket.onclose = event => {
                  if (!this.timerID) {
                    this.timerID = setInterval(() => {
                      this.init();
                    }, 5000);
                  }
                };
              })
            );
          }),
          tap(socket => {
            //  subscribe to the selected ISIN
            this.socket = socket;
            this.subscribe(this.selected);
          }),
          switchMap(socket => {
            // switch to received messages
            return new Observable(subscriber => {
              socket.onmessage = event => {
                const data = JSON.parse(event.data);
                subscriber.next(data);
              };
              return () => {
                // clean up
                console.log("closing ws");
                socket.close();
              };
            });
          }),
          takeUntil(completeSubscription),
          catchError(error => {
            console.warn(error);
            return of();
          })
        )
        .subscribe(data => {
          // console.log(data);
          this.currentStock = data;
        });
    },
    handleChange(e) {
      e.stopPropagation();
      if (this.selected) {
        this.unsubscribe(this.selected);
      }
      if (this.state === "connected") {
        this.subscribe(e.target.value);
      }
    },
    unsubscribe(isin) {
      unsubscribeFromISIN(this.socket, isin);
    },
    subscribe(isin) {
      subscribeToISIN(this.socket, isin);
      this.state = "connected";
    },
    destroy() {
      this.timderId = "null";
      this.state = "disconnected";
      completeSubscription.next();
      // completeSubscription.complete();
    }
  },
  beforeDestroy() {
    // alert("destroy");
    // completeSubscription.next();
    // completeSubscription.complete();
  }
};
</script>
