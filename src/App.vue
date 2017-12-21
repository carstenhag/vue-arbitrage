<template lang="pug">
  #app
    .container
      //flat-surface-shader.shader(
        type="canvas" 
        :mesh="{ambient: '#555', diffuse: '#c0c0c0', speed: 0.001}"
        :light="{ambient: '#107ba7', diffuse: '#0ea26e', draw: false}")
    router-view
</template>

<script>
export default {
  name: 'app',
  metaInfo: {
    title: 'Home',
    titleTemplate: '%s | Arbitrage',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  }
}
</script>

<style lang="stylus">

</style>

<style lang="stylus">
@import './colors.styl'

html, body, p
  padding 0
  margin 0

body
  background-color: secondaryColor

#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50

.container
  position: absolute;
  height: 100%;
  width: 100%;

.shader {
  width: 100vw;
  height: 100vh;
}
</style>