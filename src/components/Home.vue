<template lang="pug">
  .home
    .home-wrapper
      icon#refresh(name="refresh" scale="2" spin v-if="!pricesAvailable")
      p(v-text="(gdaxPricierThanKraken ? 'GDAX' : 'Kraken') + ': ' + formatEur(calc.priceHigh)" v-if="pricesAvailable")
      p(v-text="(gdaxPricierThanKraken ? 'Kraken' : 'GDAX') + ': ' + formatEur(calc.priceLow)"  v-if="pricesAvailable")
      p(v-text="formatEur(calc.priceHigh - calc.priceLow)" v-if="pricesAvailable")
      p(v-text="formatPercentage(calc.priceHigh / calc.priceLow * 100 - 100)" v-if="pricesAvailable")
      .inputs
        .input-group
          label(for="volumeInput") Volume (€)&nbsp;
          input#volumeInput(v-model="tradeVolumeFiat", type="number", min='0')
        .input-group
          label(for="exchangeFeePercentageInput") Exchange Fee&nbsp;
          input#exchangeFeePercentageInput(v-model="exchangeFeePercentage", type="number", min='0')
        .input-group
          label(for="withdrawCryptoFeeInput") Withdraw Crypto Fee&nbsp;
          input#withdrawCryptoFeeInput(v-model="withdrawFeeCrypto", type="number", min='0')
        .input-group
          label(for="withdrawFiatFeeInput") Withdraw Fiat Fee&nbsp;
          input#withdrawFiatFeeInput(v-model="withdrawFeeFiat", type="number", min='0')
      .control-group
        label.control.control--radio
          | Bitcoin
          input(type='radio', name='activeCrypto', value='bitcoin', v-model="activeCrypto")
          .control__indicator
        label.control.control--radio
          | Bitcoin Cash
          input(type='radio', name='activeCrypto', value='bitcoincash', v-model="activeCrypto")
          .control__indicator
        label.control.control--radio
          | Ethereum
          input(type='radio', name='activeCrypto', value='ethereum', v-model="activeCrypto")
          .control__indicator
        label.control.control--radio
          | Litecoin
          input(type='radio', name='activeCrypto', value='litecoin', v-model="activeCrypto")
          .control__indicator
      .button-group
        input.button(type="button" value="Refresh" v-on:click="getCryptoPrices()" :disabled="calc.priceHigh == null || calc.priceLow == null")
        span &nbsp;&nbsp;
        input.button(type="button" value="Calculate" v-on:click="calculate()" :disabled="calc.priceHigh == null || calc.priceLow == null")
      p#profit(v-text="'Gewinn: ' + formatEur(calc.profit) + ' — ' + formatPercentage(calc.profitPercentage)" v-if="calc.profit && calc.profitPercentage && pricesAvailable")
      p(v-if="gdaxPricierThanKraken && pricesAvailable") Buy on Kraken, sell on GDAX
      p(v-if="!gdaxPricierThanKraken && pricesAvailable") Buy on GDAX, sell on Kraken
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      calc: {
        priceHigh: null,
        priceLow: null,
        priceGDAX: null,
        priceKraken: null,
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
      return this.calc.priceGDAX !== null && this.calc.priceKraken !== null
    },
    gdaxPricierThanKraken () {
      return this.calc.priceGDAX > this.calc.priceKraken
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

      if (calc.priceGDAX > calc.priceKraken) {
        calc.priceHigh = calc.priceGDAX
        calc.priceLow = calc.priceKraken
      } else {
        calc.priceHigh = calc.priceKraken
        calc.priceLow = calc.priceGDAX
      }

      if (!this.pricesAvailable) {
        return
      }

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
      const corsPrefix = 'https://proxy-arbitrage.chagemann.de/'

      var tradePair
      switch (this.activeCrypto) {
        case 'bitcoin': tradePair = 'btceur'; break
        case 'bitcoincash': tradePair = 'bcheur'; break
        case 'ethereum': tradePair = 'etheur'; break
        case 'litecoin': tradePair = 'ltceur'; break
        default: tradePair = 'ltceur'
      }

      this.$http.get(corsPrefix + 'markets/coinbase-pro/' + tradePair + '/price').then(response => {
        this.calc.priceGDAX = response.body.result.price
        this.calculate()
      }, response => {
        console.error(response.body)
      })

      this.$http.get(corsPrefix + 'markets/kraken/' + tradePair + '/price').then(response => {
        this.calc.priceKraken = response.body.result.price
        this.calculate() // shouldnt be here, not sure how to use async/await stuff // race condition?
      }, response => {
        console.error(response.body)
      })
    },
    clearPrice () {
      this.calc.priceHigh = null
      this.calc.priceLow = null
      this.calc.priceGDAX = null
      this.calc.priceKraken = null
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
  background-color: darken(primaryColor, 30)
  max-width: 1280px
  max-height: 800px
  opacity: 0.95
  border-radius: 4px
  position: absolute
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  padding 12px 24px

  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.5);

  p, label
    color white
  
#refresh
  color white
  margin 12px 0 24px 0

#profit
  margin: 12px 0 6px


// Box to contain form controls
.control-group
  display inline-block
  vertical-align top
  text-align left
  box-shadow 0 1px 2px rgba(0, 0, 0, 0.1)
  padding 24px 0 12px 0
  width 200px

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
    

// buttons
.button
  color white
  font-size 0.8rem
  background-color: primaryColor
  padding 6px 8px
  border none
  border-radius 2px

  &:hover
    background-color: secondaryColor

.button-group
  margin-bottom 12px

.input-group
  display flex
  justify-content space-between
  margin 8px 0
  
  input
    border none
    border-radius 2px
    padding-left 4px
    margin-left 8px

.inputs
  margin-top 12px

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
