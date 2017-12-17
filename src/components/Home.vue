<template lang="pug">
  .home
    .home-wrapper
      br(v-if="!pricesAvailable")
      icon(name="refresh" scale="2" spin v-if="!pricesAvailable")
      br
      p(v-text="'GDAX:  ' + calc.priceHigh + '€'" v-if="pricesAvailable")
      p(v-text="'Kraken: ' + calc.priceLow + '€'"  v-if="pricesAvailable")
      p(v-text="formatEur(calc.priceHigh - calc.priceLow)" v-if="pricesAvailable")
      p(v-text="formatPercentage(calc.priceHigh / calc.priceLow * 100 - 100)" v-if="pricesAvailable")
      br
      label(for="volumeInput") Volumen (€)&nbsp;
      input#volumeInput(v-model="tradeVolumeFiat", type="number", min='0')
      br
      br
      label(for="exchangeFeePercentageInput") Exchange Fee&nbsp;
      input#exchangeFeePercentageInput(v-model="exchangeFeePercentage", type="number", min='0')

      br
      br
      label(for="withdrawCryptoFeeInput") Withdraw Crypto Fee&nbsp;
      input#withdrawCryptoFeeInput(v-model="withdrawFeeCrypto", type="number", min='0')
      br
      br
      label(for="withdrawFiatFeeInput") Withdraw Fiat Fee&nbsp;
      input#withdrawFiatFeeInput(v-model="withdrawFeeFiat", type="number", min='0')
      br
      br
      button(v-on:click="getLTCPrice()" :disabled="calc.priceHigh == null || calc.priceLow == null") Refresh
      span &nbsp;&nbsp;
      button(v-on:click="calculate()" :disabled="calc.priceHigh == null || calc.priceLow == null") Calculate
      br
      br
      br
      p(v-text="'Gewinn: ' + formatEur(calc.profit) + ' — ' + formatPercentage(calc.profitPercentage)" v-if="calc.profit && calc.profitPercentage")
      br
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      calc: {
        priceHigh: null,
        priceLow: null,
        profit: null,
        profitPercentage: null
      }
    }
  },
  metaInfo: { title: 'Home' },
  created () {
    this.getLTCPrice()
  },
  computed: {
    pricesAvailable () {
      return this.calc.priceHigh !== null && this.calc.priceLow !== null
    },
    getSettings () {
      return this.$store.state.settings
    },
    tradeVolumeFiat: {
      get () {
        return this.$store.state.settings.tradeVolumeFiat
      },
      set (value) {
        this.$store.commit('updateTradeVolumeFiat', value)
      }
    },
    exchangeFeePercentage: {
      get () {
        return this.$store.state.settings.exchangeFeePercentage
      },
      set (value) {
        this.$store.commit('updateExchangeFeePercentage', value)
      }
    },
    withdrawFeeCrypto: {
      get () {
        return this.$store.state.settings.withdrawFeeCrypto
      },
      set (value) {
        this.$store.commit('updateWithdrawFeeCrypto', value)
      }
    },
    withdrawFeeFiat: {
      get () {
        return this.$store.state.settings.withdrawFeeFiat
      },
      set (value) {
        this.$store.commit('updateWithdrawFeeFiat', value)
      }
    }
  },
  methods: {
    // arbitrage(priceHigh;priceLow;eur;fee;withdrawalFee) = ((eur/priceLow * (100-fee)/100) - withdrawalFee) * priceHigh - eur - 0.15
    calculate () {
      var calc = this.calc
      let settings = JSON.parse(JSON.stringify(this.getSettings))

      for (var [key, value] of Object.entries(settings)) {
        settings[key] = parseFloat(value.replace(/,/, '.')) // ParseFloat only parses with '.'
      }

      var amountCrypto = settings.tradeVolumeFiat / calc.priceLow
      amountCrypto = amountCrypto * (100 - settings.exchangeFeePercentage) / 100
      amountCrypto = amountCrypto - settings.withdrawFeeCrypto

      let fiatAmount = amountCrypto * calc.priceHigh
      calc.profit = fiatAmount - settings.tradeVolumeFiat - settings.withdrawFeeFiat
      calc.profitPercentage = calc.profit / settings.tradeVolumeFiat * 100
      this.calc = calc
    },
    getLTCPrice () {
      this.clearPrice()
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
    },
    clearPrice () {
      this.calc.priceHigh = null
      this.calc.priceLow = null
    },
    formatEur (number) {
      return number.toFixed(2) + '€'
    },
    formatPercentage (number) {
      return number.toFixed(2) + '%'
    },
    printElement (el) {
      console.log(el)
      return el
    }
  }
}
</script>

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
  color: #42b982

.home
  position: absolute
  height: 100%
  width: 100%

.home-wrapper
  background-color: #031914
  max-width: 1280px
  max-height: 800px
  opacity: 0.95
  border-radius: 4px
  position: absolute
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  padding 36px 24px

  p, label
    color white

.fa-spin
  color white


</style>
