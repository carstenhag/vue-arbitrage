<template lang="pug">
  .home
    .home-wrapper
      // Pretty dirty shit to recalculate on priceHigh/Low change
      p(v-text="'GDAX:  ' + calc.priceHigh" v-if="!calculate()")
      p(v-text="'Kraken: ' + calc.priceLow"  v-if="!calculate()")
      
      p(v-text="(calc.priceHigh - calc.priceLow).toFixed(2)")
      br
      label(for="volumeInput") Volumen (€)&nbsp;
      input#volumeInput(v-model="calc.tradeVolumeFiat", type="number", min='0')
      br
      br
      label(for="exchangeFeePercentageInput") Exchange Fee&nbsp;
      input#exchangeFeePercentageInput(v-model="calc.exchangeFeePercentage", type="number", min='0')
      br
      br
      label(for="withdrawCryptoFeeInput") Withdraw Crypto Fee&nbsp;
      input#withdrawCryptoFeeInput(v-model="calc.withdrawFeeCrypto", type="number", min='0')
      br
      br
      label(for="withdrawFiatFeeInput") Withdraw Fiat Fee&nbsp;
      input#withdrawFiatFeeInput(v-model="calc.withdrawFeeFiat", type="number", min='0')
      br
      br
      button(v-on:click="getLTCPrice()" :disabled="calc.priceHigh == null || calc.priceLow == null") Refresh
      span &nbsp;&nbsp;
      button(v-on:click="calculate()" :disabled="calc.priceHigh == null || calc.priceLow == null") Calculate
      br
      br
      br
      p(v-text="'Gewinn: ' + (calc.profit).toFixed(2) + '€ — ' + (calc.profitPercentage).toFixed(2) + '%'" v-if="calc.profit && calc.profitPercentage && calc.tradeVolumeFiat != 0")
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      calc: {
        priceHigh: null,
        priceLow: null,
        exchangeFeePercentage: 0.26,
        withdrawFeeCrypto: 0.001,
        withdrawFeeFiat: 0.15,
        tradeVolumeFiat: 500,
        profit: 0,
        profitPercentage: 0
      }
    }
  },
  metaInfo: { title: 'Home' },
  created () {
    this.getLTCPrice()
  },
  methods: {
    // arbitrage(priceHigh;priceLow;eur;fee;withdrawalFee) = ((eur/priceLow * (100-fee)/100) - withdrawalFee) * priceHigh - eur - 0.15
    calculate () {
      var calc = this.calc

      var amountCrypto = calc.tradeVolumeFiat / calc.priceLow
      amountCrypto = amountCrypto * (100 - calc.exchangeFeePercentage) / 100
      amountCrypto = amountCrypto - calc.withdrawFeeCrypto

      let fiatAmount = amountCrypto * calc.priceHigh
      calc.profit = fiatAmount - calc.tradeVolumeFiat - calc.withdrawFeeFiat
      calc.profitPercentage = calc.profit / calc.tradeVolumeFiat * 100

      this.calc = calc
    },
    getLTCPrice () {
      const corsPrefix = 'https://cors-anywhere.herokuapp.com/'

      this.$http.get(corsPrefix + 'https://api.cryptowat.ch/markets/gdax/ltceur/price', {headers: {'X-Requested-With': 'vue-arbitrage'}}).then(response => {
        this.calc.priceHigh = response.body.result.price
      }, response => {
        console.error(response.body)
      })

      this.$http.get(corsPrefix + 'https://api.cryptowat.ch/markets/kraken/ltceur/price', {headers: {'X-Requested-With': 'vue-arbitrage'}}).then(response => {
        this.calc.priceLow = response.body.result.price
      }, response => {
        console.error(response.body)
      })
    }
  },
  computed: {
  }
}

/*
  https://api.cryptowat.ch/markets/gdax/ltceur/price
  https://api.cryptowat.ch/markets/kraken/ltceur/price
  result.price
*/
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
h1, h2
  font-weight: normal

ul
  list-style-type: none
  padding: 0

li
  display: inline-block
  margin: 0 10px

a
  color: #42b983

.home
  position: absolute
  height: 100%
  width: 100%

.home-wrapper
  background-color: #031914
  width: 1280px
  height: 800px
  opacity: 0.95
  border-radius: 4px
  position: absolute
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);


  p, label
    color white


</style>
