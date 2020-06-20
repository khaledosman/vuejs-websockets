<template>
  <div class="stock-view">
    <p>ISIN {{stock.isin}} - Price: {{stock.price}}</p>
  </div>
</template>
<script>
export default {
  name: "StockView",
  props: ["stock"],
  data() {
    return {};
  },
  mounted() {}
};
</script>
<style scoped>
</style>
