<template>
  <div class="home">
  <select id="isins" name="isins" v-model="selected" @change="handleChange">
    <option
     v-for="isin in isins" 
     :key="isin"
     :selected="isin === selected"
     :value="isin">
      {{isin}}
    </option>
  </select>
  </div>
</template>

<script>
import {subscribeToStock, unsubscribeFromStock} from '../helpers/stock-helpers'
 export default {
  name: "Home",
  components: {},
  data() {
    return {
      subscriptionsMap: new Map(),
      isins: ["DE000BASF111", "DE0008469008", "EU0009652759"],
      selected: "DE000BASF111"
    }
  },
  methods: {
    handleChange(e) {
      e.stopPropagation();
    
      const isin = e.target.value
      if(this.subscriptionsMap.has(isin)) {
        return
      } else {
        
      const subscription = subscribeToStock(isin)
      .subscribe(res => {
        console.log(res)
      })
      this.subscriptionsMap.set(isin, subscription)
      }
      
    }
  },
  beforeDestroy() {
    this.subscriptionsMap.forEach((subscription, isin) => {
      unsubscribeFromStock(isin)
      .subscribe(() => {
        subscription.unsubscribe()
      })
    })
  },
};
</script>
