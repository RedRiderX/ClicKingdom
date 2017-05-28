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
    [{type: 'plain'}, {type: 'plain'}, {type: 'plain'}, {type: 'plain'}, {type: 'plain'}],
    [{type: 'plain'}, {type: 'plain'}, {type: 'plain'}, {type: 'plain'}],
    [{type: 'plain'}, {type: 'plain'}, {type: 'ruin'}, {type: 'plain'}, {type: 'plain'}],
    [{type: 'plain'}, {type: 'plain'}, {type: 'plain'}, {type: 'plain'}],
    [{type: 'plain'}, {type: 'plain'}, {type: 'plain'}, {type: 'plain'}, {type: 'plain'}],
  ]
}

Vue.component('tile', {
  template: '#tile-template',
  
  props: {
    imageUrl: String,
  },
  
  computed: {
    // TODO: make smart
    loading: function() {
      return false;
    }
  },
  
  methods: {
    emitLoadPost: function(index) {
      this.$emit('load-post', this.posts[index]);
    }
  },
  
  components: {
    'upcoming-post': {
      template: '#upcoming-post-template',
      
      props: {
        active: Boolean,
        nsfw: Boolean,
        spoiler: Boolean,
        title: String,
        thumbnail: String
      },
      
      filters: {
        isThumbnail: function(url) {
          // Cheat by just checking common cases I guess?
          switch (url) {
            case 'nsfw':
              return app.config.nsfwThumbnailUrl;
            case 'spoiler':
              return app.config.spoilerThumbnailUrl;
            
            default:
              return url;
          }
        },
        // because the reddit api is derped
        makeSSL: function(url) {
          return url.replace('http://', 'https://');
        }
      },
      
      watch: {
        active: function(isActive) {
          if (isActive) {
            var upcomingPosts = document.querySelectorAll('.upcoming-posts')[0],
                buffer = 100;
                
            upcomingPosts.scrollTop = this.$el.offsetTop - buffer;
          }
        }
      }
    }
  }
});

var vm = new Vue({
  el: 'main',
  
  data: {
    tiles: app.startingTiles
  },
  
  computed: {
    // basically changing multi-diemensional array to single diemension so my html can deal with it
    tilesRendered: function() {
      let tilesReadyforRender = []
      let rowNum = 0
      let columnNum = 0
      
      for (let row of app.startingTiles) {
        columnNum = 0
        for (let tile of row) {
          let newTile = {
            row: rowNum,
            column: columnNum,
            type: tile.type 
          }
          tilesReadyforRender.push(newTile)
          columnNum++
        }
        rowNum++
      }
      return tilesReadyforRender
    }
  },

  methods: {
  }
})
