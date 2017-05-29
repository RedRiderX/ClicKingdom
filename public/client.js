'use strict';
/* jshint eqnull:true */
/* globals Vue */

var app = {
  tileUrls: {
    farm: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Ffarm-green-tile.svg?1495997249777',
    ruin: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fruin-green-tile.svg?1495997249828',
    castle: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fmedium-castle-green-tile.svg?1495997249834',
    plain: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fplain-green-tile.svg?1495997250005',
    town: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Ftown-green-tile.svg?1495997250053',
  },
  startingTiles: [
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}],
    [{}, {}, {type: 'ruin', status: 'startTile'}, {}, {}],
    [{}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
  ],
  defaultTileProps: {
    type: 'plain',
    status: 'undiscovered',
    hp: 12
  }
}

Vue.component('tile', {
  template: '#tile-template',
  
  props: {
    type: String,
    row: Number,
    column: Number,
    status: String
  },
  
  computed: {
    imageUrl: function() {
      return app.tileUrls[this.type]
    },
    classes: function() {
      let classes = {}
      let typeClass = 'hex_' + this.type
      
      classes[typeClass] = true
      classes['hex_start'] = (this.status === 'startTile')
      
      return classes
    }
  }
})

var vm = new Vue({
  el: 'main',
  
  data: {
    tiles: app.startingTiles
  },
  
  computed: {
    // basically changing multi-diemensional array to single diemension so my html can deal with it
    tilesToRender: function() {
      let tilesReadyforRender = []
      let rowNum = 0
      let columnNum = 0
      
      for (let row of this.tiles) {
        columnNum = 0
        for (let tile of row) {
          var newTile = app.defaultTileProps
          Object.assign(newTile, tile)
          
          newTile.id = columnNum + ',' + rowNum
          newTile.columnNum = columnNum
          newTile.rowNum = rowNum
          
          tilesReadyforRender.push(newTile)
          columnNum++
        }
        rowNum++
      }
      return tilesReadyforRender
    }
  }
})
