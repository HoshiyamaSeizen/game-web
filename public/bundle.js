(()=>{"use strict";(()=>{var t;!function(t){t[t.N=0]="N",t[t.E=1]="E",t[t.S=2]="S",t[t.W=3]="W",t[t.NE=4]="NE",t[t.SE=5]="SE",t[t.SW=6]="SW",t[t.NW=7]="NW"}(t||(t={}));class e{constructor(t,e){this.x=t,this.y=e}equal(t){return this.x==t.x&&this.y==t.y}compare(t){return this.equal(t)?0:this.x<t.x||this.x==t.x&&this.y<t.y?-1:1}toString(){return`(${this.x}, ${this.y})`}}const i=16;class s{constructor(){this.sprite=null,this.spriteWhenUsed=null}getSprite(){return this.sprite}getUSprite(){return this.spriteWhenUsed}setSprite(t){this.sprite=t}setUSprite(t){this.spriteWhenUsed=t}}class l extends s{constructor(){super(...arguments),this.pos=new e(0,0),this.prevDir=t.S}setPos(t){this.pos=t}getDir(){return this.prevDir}getPos(){return this.pos}}class n extends l{move(t){}hit(t){}getHit(t){}getName(){return""}getHP(){return 0}clone(){return new n}}class r extends l{move(t){}hit(t){}getHit(t){}getName(){return""}getHP(){return 0}clone(){return new r}}var h;!function(t){t[t.normal=0]="normal",t[t.start=1]="start",t[t.finish=2]="finish"}(h||(h={}));class a extends s{constructor(t=h.normal,e=!0,i=null,s=null){super(),this.accessible=e,this.state=t,this.entity=i,this.item=s}getState(){return this.state}getItem(){return this.item}getEntity(){return this.entity}hasItem(){return null!=this.item&&this.isAccessible()}isFree(){return null!=this.entity&&this.isAccessible()}isEntityPlayer(){return this.entity instanceof r}isEntityEnemy(){return this.entity instanceof n}isStart(){return this.state==h.start}isFinish(){return this.state==h.finish}isAccessible(){return this.accessible}setEntity(t){this.entity=t}setItem(t){this.item=t}setState(t){this.state=t}toggleAccessibility(){this.accessible=!this.accessible}}class o{constructor(t=0,e=0){this.width=t,this.height=e,this.cells=Array.from(Array(t),(()=>new Array(e)));for(let i=0;i<t;i++)for(let t=0;t<e;t++)this.cells[i][t]=new a}cellAt(t){var i=t instanceof e?t:new e(t.x,t.y);if(!this.isInField(i))throw new Error("Not in a field");return this.cells[t.x][t.y]}getWidth(){return this.width}getHeigth(){return this.height}isInField(t){return t.x>=0&&t.x<this.width&&t.y>=0&&t.y<this.height}log(){let t="";for(let e=0;e<this.height;e++){for(let i=0;i<this.width;i++)this.cells[i][e].isAccessible()||this.cells[i][e].isFinish()?this.cells[i][e].isEntityPlayer()?t+="p ":this.cells[i][e].isEntityEnemy()?t+="e ":this.cells[i][e].isAccessible()?this.cells[i][e].isStart()?t+="s ":this.cells[i][e].isFinish()?t+="f ":this.cells[i][e].hasItem()?t+="i ":t+="  ":t+="b ":t+="x ";t+="\n"}console.log(t)}}const c=JSON.parse('[{"name":"map1","width":14,"height":9,"enemiesCount":5,"enemies":["Zombie","Hell-Hound","Ghost","Zombie","Knight"],"itemsCount":6,"items":["Iron_Sword","Leather_Armor","Fire_Spell","Water_Spell","Healing_Potion","Healing_Potion"],"layout":["x x x x x x x x x x x x x x","x o o o o x o o o x x x x x","x o e o o o o o o e o o x x","x e o o o x o o o x x o x x","x x x o x x x x x x x e x x","x i o o x o o o o o o o x x","x i o o x o o o e o o o x x","x s i i x o f i i o o o x x","x x x x x x x x x x x x x x"],"tilesheet":"dungeon1","spritesCount":4,"sprites":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0}],"spritesLayout":["0 0 0 0 0 0 0 0 0 0 0 0 0 0","0 1 1 1 1 0 1 1 1 0 0 0 0 0","0 1 2 2 2 2 2 2 1 1 1 1 0 0","0 1 2 2 1 0 2 2 2 0 0 1 0 0","0 0 0 1 0 0 0 0 0 0 0 1 0 0","0 1 1 1 0 2 2 2 2 2 2 2 0 0","0 1 1 1 0 2 2 2 2 2 2 2 0 0","0 1 1 1 0 2 3 2 2 2 2 2 0 0","0 0 0 0 0 0 0 0 0 0 0 0 0 0"],"startRulesCount":6,"finishRulesCount":2,"startRules":["start.entity.player.mhp.500.","start.entity.player.hp.500.","start.entity.player.mmp.200.","start.entity.player.mp.200.","start.entity.Zombie.dam.1.","start.item.Iron_Sword.dam.500."],"finishRules":["finish.entity.Zombie.kill..","finish.entity.all.count.2."]}]'),g=["dungeon1"],d=document.getElementById("canvas");let x=new class{constructor(t=!1){this.field=new o,this.fromSave=t}setSize(t,e){this.field=new o(t,e)}toggleCellAccessibility(t){this.field.cellAt(t).isAccessible()&&this.field.cellAt(t).toggleAccessibility()}setOutsideWalls(){for(let t=0;t<this.field.getHeigth();t++)this.toggleCellAccessibility(new e(0,t)),this.toggleCellAccessibility(new e(this.field.getWidth()-1,t));for(let t=0;t<this.field.getWidth();t++)this.toggleCellAccessibility(new e(t,0)),this.toggleCellAccessibility(new e(t,this.field.getHeigth()-1))}setStart(t){for(let e=0;e<this.field.getWidth();e++)for(let e=0;e<this.field.getHeigth();e++)this.field.cellAt(t).isStart()&&this.field.cellAt(t).setState(h.normal);this.field.cellAt(t).setState(h.start)}setFinish(t){for(let e=0;e<this.field.getWidth();e++)for(let e=0;e<this.field.getHeigth();e++)this.field.cellAt(t).isFinish()&&this.field.cellAt(t).setState(h.normal);this.field.cellAt(t).setState(h.finish)}setEntity(t,e){this.field.cellAt(e).setEntity(t),t.setPos(e)}setItem(t,e){this.field.cellAt(e).setItem(t),t.setPos(e)}canItemBeSet(t){return this.field.isInField(t)&&!this.field.cellAt(t).hasItem()}canEntityBeSet(t){return this.field.isInField(t)&&this.field.cellAt(t).isFree()}setSprite(t,e){this.field.cellAt(e).setSprite(t)}buildPresetMap(t,i){let s=c.find((e=>e.name==t));this.setSize(s.width,s.height),s.layout.forEach(((t,i)=>{t.split(" ").forEach(((t,s)=>{switch(t){case"s":this.setStart(new e(s,i));break;case"f":this.setFinish(new e(s,i));break;case"b":this.toggleCellAccessibility(new e(s,i)),this.setFinish(new e(s,i));case"x":this.toggleCellAccessibility(new e(s,i))}}))}));let l=i.getTilesheets().get(s.tilesheet),n=[];s.sprites.forEach((t=>{n.push({source:l,pos:new e(t.x,t.y)})})),s.spritesLayout.forEach(((t,i)=>{t.split(" ").forEach(((t,s)=>{this.setSprite(n[+t],new e(s,i))}))}))}getPresetMap(t,e){return this.buildPresetMap(t,e),this.getField()}getField(){let t=this.field;return this.reset(),t}reset(){this.field=new o}},m=new class{constructor(){this.tilesheets=new Map,this.enemies=new Map,this.items=new Map}readTilesheets(){let t;console.log("Reading tilesheets:"),g.forEach((e=>{t=new Image,t.src=`../public/assets/tilesheets/${e}.png`,this.tilesheets.set(e,t),console.log(`\t${e}`)})),console.log("\n")}readEnemies(){}readItems(){}getTilesheets(){return this.tilesheets}getEnemies(){return this.enemies}getItems(){return this.items}checkTexture(t){return!0}checkEnemy(t){return!0}checkItem(t){return!0}},u=new class{constructor(){this.animState={secondAnimFrame:!1,playerResting:!1,playerDropping:!1,playerDrinking:!1,scale:1},this.canvas=document.getElementById("canvas"),this.ctx=this.canvas.getContext("2d"),this.ctx.imageSmoothingEnabled=!1,this.ctx.fillStyle="black"}drawItem(t,e,i){}drawEnemy(t,e,i){}drawPlayer(t,e){}drawSprite(t,e,s){this.ctx.drawImage(t.source,t.pos.x*i,t.pos.y*i,i,i,e,s,i*this.animState.scale,i*this.animState.scale)}drawField(t){let s,l,n=i*this.animState.scale;for(let i=0;i<t.getWidth();i++)for(let r=0;r<t.getHeigth();r++)s=i*n+0,l=r*n+0,this.drawSprite(t.cellAt(new e(i,r)).getSprite(),s,l)}drawInfo(){}clear(){this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)}toggleAnimFrame(){this.animState.secondAnimFrame=!this.animState.secondAnimFrame}clearPlayerAction(){this.animState.playerResting=!1,this.animState.playerDropping=!1,this.animState.playerDrinking=!1}playerRest(){this.animState.playerResting=!0}playerDrop(){this.animState.playerDropping=!0}playerDrink(){this.animState.playerDrinking=!0}getScale(){return this.animState.scale}changeScale(t){this.animState.scale=t<=0?1:t>6?6:t}};m.readTilesheets();let y=x.getPresetMap("map1",m);y.log();const p=()=>{d.width=window.innerWidth,d.height=window.innerHeight};p(),window.addEventListener("resize",p,!1);const f=t=>{u.clear(),u.drawField(y),window.requestAnimationFrame(f)};window.requestAnimationFrame(f)})()})();