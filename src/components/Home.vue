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
      .control-group
        label.control.control--radio
          | Bitcoin
          input(type='radio', name='activeCrypto', value='bitcoin', v-model="activeCrypto")
          .control__indicator
        label.control.control--radio
          | Ethereum
          input(type='radio', name='activeCrypto', value='ethereum', v-model="activeCrypto")
          .control__indicator
        label.control.control--radio
          | Litecoin
          input(type='radio', name='activeCrypto', value='litecoin', v-model="activeCrypto")
          .control__indicator
      br
      button(v-on:click="getCryptoPrices()" :disabled="calc.priceHigh == null || calc.priceLow == null") Refresh
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
    this.getCryptoPrices()
  },
  computed: {
    pricesAvailable () {
      return this.calc.priceHigh !== null && this.calc.priceLow !== null
    },
    getSettings () {
      return this.$store.state.settings
    },
    activeCrypto: {
      get () {
        return this.$store.state.activeCrypto
      },
      set (value) {
        this.$store.commit('updateActiveCrypto', value)
        this.getCryptoPrices()
      }
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
    getCryptoPrices () {
      this.clearPrice() // race condition?
      const corsPrefix = 'https://cors-anywhere.herokuapp.com/'

      var tradePair
      switch (this.activeCrypto) {
        case 'bitcoin': tradePair = 'btceur'; break
        case 'ethereum': tradePair = 'etheur'; break
        case 'litecoin': tradePair = 'ltceur'; break
        default: tradePair = 'ltceur'
      }

      this.$http.get(corsPrefix + 'https://api.cryptowat.ch/markets/gdax/' + tradePair + '/price', {headers: {'X-Requested-With': 'vue-arbitrage'}}).then(response => {
        this.calc.priceHigh = response.body.result.price
      }, response => {
        console.error(response.body)
      })

      this.$http.get(corsPrefix + 'https://api.cryptowat.ch/markets/kraken/' + tradePair + '/price', {headers: {'X-Requested-With': 'vue-arbitrage'}}).then(response => {
        this.calc.priceLow = response.body.result.price
        this.calculate() // shouldnt be here, not sure how to use async/await stuff // race condition?
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
@import '../colors.styl'

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



// Box to contain form controls
.control-group
  display inline-block
  vertical-align top
  background $color--white
  text-align left
  box-shadow 0 1px 2px rgba(0, 0, 0, 0.1)
  padding 30px
  width 200px
  height 210px
  margin 10px

// Basic control styles
.control
  display block
  position relative
  padding-left 30px
  margin-bottom 15px
  cursor pointer
  font-size 18px
  
  // Hide default browser input
  input
    position absolute
    z-index -1
    opacity 0
    

// Custom control
.control__indicator
  position absolute
  top 2px
  left 0
  height 20px
  width 20px
  background lightGray
  
  .control--radio &
    border-radius 50% // Makes radio buttons circlular
  
  // Hover and focus
  .control:hover input ~ &,
  .control input:focus ~ &
    background mediumGray
  
  // Checked
  .control input:checked ~ &
    background primaryColor

  // Hover when checked
  .control:hover input:not([disabled]):checked ~ &,
  .control input:checked:focus ~ &
    background secondaryColor
  
  // Hide default browser input
  .control input:disabled ~ &
    background lightGray
    opacity 0.6
    pointer-events none

  &:after
    content ''
    position absolute
    display none // Hide check

    .control input:checked ~ &
      display block // Show check
 
    // Checkbox tick
    .control--checkbox &
      left 8px
      top 4px
      width 3px
      height 8px
      border solid white
      border-width 0 2px 2px 0
      transform rotate(45deg)
    
    // Disabled tick colour
    .control--checkbox input:disabled ~ &
      border-color darkGray

    // Radio button inner circle
    .control--radio &
      left 7px
      top 7px
      height 6px
      width 6px
      border-radius 50%
      background white

    // Disabled circle colour
    .control--radio input:disabled ~ &
      background darkGray

</style>
