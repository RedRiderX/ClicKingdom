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
    [
      {type: 'castle', faction: 'red', status: 'undiscovered', initialStrength: 100, maxStrength: 100},
      {type: 'plain', faction: 'red', status: 'undiscovered', initialStrength: 50, maxStrength: 50},
      {}, {}, {}
    ],
    [
      {type: 'plain', faction: 'red', status: 'undiscovered', initialStrength: 50, maxStrength: 50},
      {}, {}, {}
    ],
    [{}, {}, {type: 'ruin', status: 'startTile'}, {}, {}],
    [{}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
  ],
  startingStats: {
    red: {
      attackPower: 10,
      // defaultTileStrength: 50
    },
    blue: {
      attackPower: 0,
      clickPower: 1
    }
  },
  defaultTileProps: {
    type: 'plain',
    faction: 'neutral',
    status: 'undiscovered',
    initialStrength: 12,
    maxStrength: 12
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
    // castle: {
    //   popCost: 2
    // }
  },
  tickSpeed: 1000
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
    initialStrength: Number,
    maxStrength: Number,
    active: Boolean
  },
  
  data: function() {
    return {
      strength: this.initialStrength
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
      
      if (this.strength < this.maxStrength &&
          this.strength > 0
      ) {
        // Find strength as an inverse percentage of maxStrength
        // eg 75 strength is 25% inverse percentage of 100 maxStrength
        activeMeters.strength = {
          min: 0,
          max: 1, 
          low: .25,
          high: .75,
          optimum: 1,
          value: 1 - (this.strength / this.maxStrength)
        } 
      }
      
      return activeMeters
    }
  },
  
  methods: {
    click: function(event) {
      if (this.status == 'undiscovered') {
        return false  
      }
      if (this.type == 'ruin') {
        // lower strength and until 0 then trigger state change?
        this.lowerStrength()
      }
      // lower strength until 0 then trigger state change menu?
      if (this.type == 'plain' && this.faction == 'neutral') {
        this.lowerStrength()
      }
      if (this.type == 'plain' && this.faction == 'blue') {
        this.triggerMenu('build');
      }
      if (this.faction != 'blue' && this.faction != 'neutral') {
        this.triggerMenu('war');
      }
      return false
    },
    lowerStrength: function() {
      this.strength--
      if (this.strength <= 0) {
        this.strength = 0
        this.$emit('update-state', {
          eventType: 'healthEmpty',
          row: this.row,
          column: this.column
        })
      }
    },
    raiseStrength: function() {
      this.strength++
      if (this.strength >= this.maxStrength) {
        this.strength = this.maxStrength
        this.$emit('update-state', {
          eventType: 'healthFull',
          row: this.row,
          column: this.column
        })
      }
    },
    triggerMenu: function(type) {
      this.$emit('launch-menu', {
        menuType: type,
        row: this.row,
        column: this.column
      })
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
      // popCost: app.startingCosts.castle.popCost
    },
    tick: null,
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
      let tileInQuestion = this.tiles[event.row][event.column]
      switch (event.eventType) {
        case 'healthEmpty':          
          if (tileInQuestion.type === 'ruin') {
            this.upgradeTile(event.row, event.column, 'blue', 'castle')
            this.cursorTrail = app.cursorStates.reign
            this.triggerFanfare()
          }
          else if (tileInQuestion.type === 'plain') {
            this.upgradeTile(event.row, event.column, 'blue', 'plain')
            this.cursorTrail = app.cursorStates.build
          }
          break;
        case 'healthFull':
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
        this.revealSurroundingTiles(row, column)
      }
    },
    revealSurroundingTiles: function(row, column) {
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
      
      // Can't think of an esier solution than tweaking numbers for even rows
      if (row % 2 !== 0) {
        tilesAffected[0].column++ 
        tilesAffected[1].column++ 
        tilesAffected[4].column++ 
        tilesAffected[5].column++ 
      }
      
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
      }
      else if (type === 'ruin') {
        this.cursorTrail = app.cursorStates.build
      }
      else if (faction === 'blue' && type === 'plain') {
        this.cursorTrail = app.cursorStates.build
      }
      else if (faction === 'neutral') {
        this.cursorTrail = app.cursorStates.annex
      }
      else if (faction !== 'neutral' && faction !== 'blue') {
        this.cursorTrail = app.cursorStates.fight
      }
      else {
        this.cursorTrail = app.cursorStates.reign  
      }
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
    },
    createTick: function() {
      this.tick = setInterval(this.doTick, app.tickSpeed)
    },
    destroyTick: function() {
      this.tick = clearInterval(this.tick) 
    },
    doTick: function() {
      // TODO: Something
      console.log('tick')
    }
  },
  
  mounted: function() {
    this.createTick()
  }
})
