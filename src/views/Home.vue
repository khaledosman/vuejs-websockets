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
import { Subject } from "rxjs";
import { webSocket } from "rxjs/websocket";
import { takeUntil, catchError } from "rxjs/operators";
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
      this.subject = webSocket({
        url: "ws://159.89.15.214:8080/",
        openObserver: {
          next: event => {
            this.state = "connected";
            this.$forceUpdate();
          }
        },
        closeObserver: {
          next: event => {
            this.state = "disconnected";
            this.$forceUpdate();
          }
        }
      });
      this.subject.pipe(takeUntil(completeSubscription)).subscribe(
        msg => {
          console.log(JSON.stringify(msg));
          this.currentStock = msg;
        },
        err => console.log(err),
        () => console.log("complete")
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
      this.subject.next({ unsubscribe: isin });
    },
    subscribe(isin) {
      this.subject.next({ subscribe: isin });
    },
    destroy() {
      completeSubscription.next();
      this.subject.complete(); // Closes the connection.
    }
  },
  beforeDestroy() {
    this.destroy();
  }
};
</script>
