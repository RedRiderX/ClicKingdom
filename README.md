ClicKingdom
=========================
A medival empire-building clicker

## Initial Plan

You start with a ruin. You can only click it. As you start to click it a bar appears(?). After enough clicking it becomes a (small) castle.

The surrounding tiles come into focus, you can click these.
* You must click tiles in your sphere of influce to gain access to them. (Owned tiles should have a border???)
* Just clicking owned tiles gets you a slightly increased conversion rate???
  * for castle when clicked you work on leveling up click power (which results in more conversions/c)
* Once clicked the tile brings up a menu of options:
 * Build (Numbers are mostly Per Tick)
   * Barracks: +1 power. -1 gold -1 food -1 pop
   * Town: +1 gold production. -1 pop
   * Farm: +1 food. -1 pop
   * (future idea) Castle: +1 click power. -2 pop(?)


## What is the hp of a tile? 
Tiles have a strength and power
* power is the ability to affect strength
* strength is the ability to defend a tile
   
## How is sphere of influnce calculated?
just 1 tile radius

## What are the player's stats?
  * gold production per s
  * current gold
  * food production per s
  * current food
  * pop potential
  * (attack) power potential (no static power accumlation)
  * click power
  
## How will conquest work?
You can click on an tile controled by an opponent, you will then get a power rating and a button to declare war.

Once that happens all power potential (or an equal slice) is moved onto that tile to lower strength.

Opponent will also move power potential to that square to raise strength

When strength is depleted control will flip

Player can declare peace whenever with no consquences(??)

### Power rating
Based on relative power potential, player and opponent will recive power ratings:

Example:
  * player has 100 pp and opponent has 50pp:
    * Player rating: SCARY
    * Opponent rating: PUNY
  * player has 50 pp and opponent has 50pp:
    * Player rating: COOL
    * Opponent rating: COOL