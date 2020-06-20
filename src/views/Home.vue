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
import { webSocket } from "rxjs/websocket";
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
const completeSubscription = new Subject();
export default {
  name: "Home",
  components: {
    StockView
  },
  data() {
    return {
      subject: new Subject(),
      state: "disconnected",
      isins: ["DE000BASF111", "DE0008469008", "EU0009652759"],
      selected: "DE000BASF111",
      currentStock: null
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.subject = webSocket("ws://159.89.15.214:8080/");
      this.subject.pipe(takeUntil(completeSubscription)).subscribe(
        msg => {
          console.log(JSON.stringify(msg));
          this.currentStock = msg;
        }, // Called whenever there is a message from the server.
        err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
        () => console.log("complete") // Called when connection is closed (for whatever reason).
      );

      this.subject.next({ subscribe: this.selected });
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
      // unsubscribeFromISIN(this.socket, isin);
      this.subject.next({ unsubscribe: isin });
    },
    subscribe(isin) {
      // subscribeToISIN(this.socket, isin);
      this.subject.next({ subscribe: isin });
      this.state = "connected";
    },
    destroy() {
      this.timderId = "null";
      this.state = "disconnected";
      completeSubscription.next();
      // This will send a message to the server once a connection is made. Remember value is serialized with JSON.stringify by default!
      this.subject.complete(); // Closes the connection.
      // completeSubscription.complete();
    }
  },
  beforeDestroy() {
    this.destroy();
    // alert("destroy");
    // completeSubscription.next();
    // completeSubscription.complete();
  }
};
</script>
