'use strict';
/* jshint eqnull:true */
/* globals Vue */

var app = {
  tileUrls: {
    neutral: {
      farm: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Ffarm-green-tile.svg?1495997249777',
      ruin: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fruin-green-tile.svg?1495997249828',
      castle: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fmedium-castle-green-tile.svg?1495997249834',
      plain: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fplain-green-tile.svg?1495997250005',
      town: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Ftown-green-tile.svg?1495997250053',
    },
    red: {
      castle: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fmedium-castle-red-tile.svg?1495997249834',
      plain: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fplain-red-tile.svg?1495997250005',
    },
    blue: {
      castle: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fmedium-castle-blue-tile.svg?1496500760377',
      plain: 'https://cdn.glitch.com/7f1f1519-54c4-4968-b334-78d8fe707213%2Fplain-blue-tile.svg?1496500760310',
    }
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
    faction: 'neutral',
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
  },
  cursorStates: {
    reign: '👑',
    denied: '🚫',
    build: '🛠️',
    fight: '⚔️',
    annex: '🚩',
  },
  startingCosts: {
    barracks: {
      goldCost: 1,
      foodCost: 1,
      popCost: 1
    },
    town: {
      popCost: 1
    },
    farm: {
      popCost: 1
    },
    castle: {
      popCost: 2
    }
  }
}

// silly cursor trail that amuses me
$(document)
  .mousemove(function(e){
    $("#cursor-trail").css({left:e.pageX, top:e.pageY});
  })

Vue.component('tile', {
  template: '#tile-template',
  
  props: {
    type: String,
    faction: String,
    row: Number,
    column: Number,
    status: String,
    initialHp: Number,
    maxHp: Number,
    active: Boolean
  },
  
  data: function() {
    return {
      hp: this.initialHp
    }
  },
  
  computed: {
    imageUrl: function() {
      return app.tileUrls[this.faction][this.type]
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
    activeMeters: function() {
      let activeMeters = {}
      
      if (this.hp < this.maxHp &&
          this.hp > 0
      ) {
        activeMeters.hp = {
          min: 0,
          max: this.maxHp, 
          low: this.maxHp * .25,
          high: this.maxHp * .75,
          optimum: this.maxHp,
          value: this.hp
        } 
      }
      
      return activeMeters
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
          row: this.row,
          column: this.column
        })
      }
    }
  }
})

Vue.component('tile-meter', {
  template: '#tile-meter-template',
  
  props: {
    type: String,
    min: Number,
    max: Number,
    low: Number,
    high: Number,
    optimum: Number,
    value: Number
  },
  
  computed: {
    classes: function() {
      let classes = {}
      classes['meter_type_' + this.type] = true
      return classes
    }
  }
})

var vm = new Vue({
  el: 'main',
  
  data: {
    tiles: app.makeStartingTiles(),
    gold: 0,
    pop: 0,
    attackPower: 0,
    clickPower: 0,
    food: 0,
    cursorTrail: false,
    activeTile: {
      column: null,
      row: null
    },
    barracks: {
      goldCost: app.startingCosts.barracks.goldCost,
      foodCost: app.startingCosts.barracks.foodCost,
      popCost: app.startingCosts.barracks.popCost
    },
    town: {
      popCost: app.startingCosts.town.popCost
    },
    farm: {
      popCost: app.startingCosts.farm.popCost
    },
    castle: {
      popCost: app.startingCosts.castle.popCost
    }
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
    },
    // TODO: make this do something
    progressIndicator: function() {
      return '⌛'
    },
    tileActions: function() {
      let actions = []
      if (this.activeTile.row === null || this.activeTile.column === null) {
        return actions
      }
      let pertinentTile = this.tiles[this.activeTile.row][this.activeTile.column]
      
      if (this.gold - this.barracks.goldCost > 0 &&
          this.food - this.barracks.foodCost > 0 &&
          this.pop - this.barracks.popCost > 0
      ) {
          actions.push({
            title: 'Make Barracks',
            name: 'makeBarracks'
          })
      }
      if (this.pop - this.town.popCost > 0) {
          actions.push({
            title: 'Make Town',
            name: 'makeTown'
          })
      }
      if (this.pop - this.farm.popCost > 0) {
          actions.push({
            title: 'Make Farm',
            name: 'makeFarm'
          })
      }
      if (this.pop - this.castle.popCost > 0) {
          actions.push({
            title: 'Make Castle',
            name: 'makeCastle'
          })
      }
      
      return actions
    }
  },
  
  methods: {
    handleTileStateChange: function(event) {
      console.log(event)
      switch (event.eventType) {
        case 'healthFull':
          let tileInQuestion = this.tiles[event.row][event.column]
          
          if (tileInQuestion.type === 'ruin') {
            this.upgradeTile(event.row, event.column, 'blue', 'castle')
            this.cursorTrail = app.cursorStates.reign
            this.triggerFanfare()
          }
          break
      }
    },
    triggerFanfare: function() {
      // TODO: idk make confetti happen or something
    },
    upgradeTile: function(row, column, faction, newType) {
      // TODO: handle of bunch of logic for type changes
      // right now ruin to castle just means new image and full health for tile
      this.tiles[row][column]['faction'] = faction
      this.tiles[row][column]['type'] = newType
      
      if (faction === 'blue') {
        this.revealSurrondingTiles(row, column)
      }
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
    },
    handleTileMouseEnter: function(row, column) {
      let type = this.tiles[row][column].type
      let faction = this.tiles[row][column].faction
      let status = this.tiles[row][column].status
      
      if (status === 'undiscovered') {
        this.cursorTrail = app.cursorStates.denied
        return;
      }
      if (type === 'ruin') {
        this.cursorTrail = app.cursorStates.build
        return
      }
      if (type === 'village') {
        this.cursorTrail = app.cursorStates.fight
        return
      }
      if (faction === 'neutral') {
        this.cursorTrail = app.cursorStates.annex
        return
      }
      
      this.cursorTrail = app.cursorStates.reign
    },
    handleTileMouseLeave: function(row, column) {
      this.cursorTrail = false
    },
    makeTileActive: function(row, column, event) {
      if (this.tiles[row][column].status === 'undiscovered') {
        return
      }
      
      this.activeTile = {
        row,
        column
      }
      
      event.stopPropagation()
    },
    handleClick: function(event) {      
      this.activeTile = {
        row: null,
        column: null
      }
    }
  },
  
})
