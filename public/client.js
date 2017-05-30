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
    [{}, {}, {type: 'ruin', status: 'startTile', initialHp: 0}, {}, {}],
    [{}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
  ],
  defaultTileProps: {
    type: 'plain',
    status: 'undiscovered',
    initialHp: 12,
    maxHp: 12
  },
  makeStartingTiles: function() {
    // add default props to list of tiles
    let tiles = app.startingTiles
    let rowNum = 0
    let columnNum = 0
    
    for (let row of tiles) {
      columnNum = 0
      for (let tile of row) {
        // ugh js object references are dumb
        tiles[rowNum][columnNum] = Object.assign(Object.assign({}, this.defaultTileProps), tile)
        columnNum++
      }
      rowNum++
    }
    
    return tiles
  }
}

Vue.component('tile', {
  template: '#tile-template',
  
  props: {
    type: String,
    row: Number,
    column: Number,
    status: String,
    initialHp: Number,
    maxHp: Number
  },
  
  data: function() {
    return {
      hp: this.initialHp
    }
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
      classes['hex_active'] = this.active
      classes['hex_revealed'] = this.revealed
      
      return classes
    },
    revealed: function() {
      // will probably have more complicated logic here later
      // I also probably need more complex states
      if (this.status === 'startTile' ||
          this.status === 'discovered'
      ) {
        return true
      }
      return false
    },
    active: function() {
      if (this.hp < this.maxHp &&
          this.hp > 0
      ) {
        return true
      }
      return false
    }
  },
  
  methods: {
    click: function(event) {
      // start out with the basics
      if (this.type == 'ruin') {
        // raise hp and if high enough trigger state change?
        this.raiseHp()
      }
      return false
    },
    lowerHp: function() {
      this.hp--
      if (this.hp <= 0) {
        this.updateState('')
        this.$emit('update-state', {
          eventType: 'healthEmpty',
          currentState: this.type,
          row: this.row,
          column: this.column
        })
      }
    },
    raiseHp: function() {
      this.hp++
      if (this.hp >= this.maxHp) {
        this.hp = this.maxHp
        this.$emit('update-state', {
          eventType: 'healthFull',
          currentState: this.type,
          row: this.row,
          column: this.column
        })
      }
    }
  }
})

var vm = new Vue({
  el: 'main',
  
  data: {
    tiles: app.makeStartingTiles()
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
          // ugh js object references are dumb
          let newTile = Object.assign({}, tile)
          
          newTile.id = columnNum + ',' + rowNum
          newTile.column = columnNum
          newTile.row = rowNum
          
          tilesReadyforRender.push(newTile)
          columnNum++
        }
        rowNum++
      }
      return tilesReadyforRender
    }
  },
  
  methods: {
    handleTileStateChange: function(event) {
      console.log(event)
      switch (event.eventType) {
        case 'healthFull':
          if (event.currentState === 'ruin') {
            this.upgradeTile(event.row, event.column, 'castle')
            this.triggerFanfare()
          }
          break
      }
    },
    triggerFanfare: function() {
      // TODO: idk make confetti happen or something
    },
    upgradeTile: function(row, column, newType) {
      // TODO: handle of bunch of logic for type changes
      // right now ruin to castle just means new image and full health for tile
      this.tiles[row][column]['type'] = newType
      this.revealSurrondingTiles(row, column)
    },
    revealSurrondingTiles: function(row, column) {
      let tilesAffected = [
        {
          row: row - 1,
          column: column - 1
        },
        {
          row: row - 1,
          column: column // because hex grid
        },
        {
          row: row,
          column: column - 1
        },
        {
          row: row,
          column: column + 1
        },
        {
          row: row + 1,
          column: column - 1
        },
        {
          row: row + 1,
          column: column // because hex grid
        }
      ]
      
      for (let tile of tilesAffected) {
        if (this.tiles[tile.row][tile.column].status === 'undiscovered') {
          this.tiles[tile.row][tile.column].status = 'discovered'
        }
      }
    }
  },
  
})
