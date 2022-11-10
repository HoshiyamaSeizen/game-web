import { Enemy } from './Objects/Enemy';
import { AudioManager } from './Managers/AudioManager';
import { Dialogue } from './Objects/Dialogue';
import { initStartRules } from './Rules/RuleChecker';
import { GameRule } from './Rules/GameRule';
import { MapManager } from './Managers/MapManager';
import { Position } from './Positioning';
import { DrawManager } from './Managers/DrawManager';
import { EventManager, ACTION } from './Managers/EventManager';
import { SaveManager } from './Managers/SaveManager';
import { ObjectStorage } from './Storage';
import { GameEvent } from './Event';
import { Item } from './Objects/Item';
import { Entity } from './Objects/Entity';
import { Player } from './Objects/Player';
import { Menu } from './Menu';
import { SpriteManager } from './Managers/SpriteManager';

export class Game {
	private static instance?: Game;

	private gameStarted = false;
	private gameActive = false;
	private playersTurn = true;
	private objectStorage = new ObjectStorage();
	private mapManager = new MapManager();
	private spriteManager = new SpriteManager();
	private eventManager = new EventManager();
	private audioManager = new AudioManager();
	private saveManager = new SaveManager();
	private dialogue = new Dialogue();
	private entities: Entity[] = [];
	private items: Item[] = [];
	private events: GameEvent[] = [];
	private startRules: GameRule[] = [];
	private finishRules: GameRule[] = [];
	private drawManager?: DrawManager;
	private menu?: Menu;
	private player?: Player;

	public static getInstance(): Game {
		if (!this.instance) this.instance = new Game();
		return this.instance;
	}

	private constructor() {}
	public async start() {
		this.gameActive = true;

		// Open Menu
		this.menu = new Menu();

		// Read sprites, tiles and sound
		await this.spriteManager.readSprites();
		await this.mapManager.readTiles();
		await this.audioManager.readAudio();

		// Read Enemies, NPCs & Items
		this.objectStorage.readEnemies();
		this.objectStorage.readNPCs();
		this.objectStorage.readItems();

		// Init drawer
		this.drawManager = new DrawManager();
		this.drawManager.addResizeListener();

		// Init Player
		this.player = new Player();
		this.spriteManager.setPlayerSprite(this.player);

		// Load Map and set Player
		this.mapManager.loadMap();

		// Life Cycle
		let prevTimestamp = 0;
		let elapsed: number;
		let loops = 0;
		const step = (timestamp: number) => {
			if (!this.menu!.opened()) {
				if (!this.playersTurn) {
					this.processEntities();
				} else if (this.eventManager!.hasAction()) {
					this.performAction(this.eventManager!.getAction()!);
					this.eventManager?.clearActions();
				}

				elapsed = timestamp - prevTimestamp;
				if (elapsed >= 1000) {
					this.drawManager?.toggleAnimFrame();
					prevTimestamp = timestamp;

					if (loops++ >= 4) {
						this.audioManager.playAudio(...this.getRandEnemySound());
						loops = 0;
					}
				}

				// Draw
				this.drawManager!.clear();
				this.drawManager!.drawField(this.mapManager.getField()!);
				this.drawManager!.drawInfo();
				this.drawManager!.drawLog();
				this.drawManager!.drawDialogue();
			}
			if (this.gameActive) window.requestAnimationFrame(step);
		};
		window.requestAnimationFrame(step);
	}

	// Game Process
	public endGame(): void {
		this.gameActive = false;
		this.menu?.endScreen(this.player!.getHP() <= 0);
	}
	public playerActed(): void {
		this.clearEvents();
		this.drawManager?.clearPlayerAction();
		this.playersTurn = false;
	}
	public isActive(): Boolean {
		return this.gameActive;
	}
	public hasStarted(): Boolean {
		return this.gameStarted;
	}
	public setStarted(): void {
		this.gameStarted = true;
	}
	public clearMap() {
		this.entities.length = 0;
		this.items.length = 0;
		this.clearEvents();
		this.clearRules();
	}

	// Player
	public getPlayer(): Player {
		return this.player!;
	}
	public getItems(): Item[] {
		return this.items!;
	}
	public setPlayer(pos?: Position): void {
		const field = this.mapManager.getField();
		if (pos) {
			field.cellAt(pos).setEntity(this.player!);
			this.player?.setPos(pos);
		} else {
			for (let i = 0; i < field!.getWidth(); i++) {
				for (let j = 0; j < field!.getHeigth(); j++) {
					if (field.cellAt(new Position(i, j)).isStart()) {
						field.cellAt(new Position(i, j)).setEntity(this.player!);
						this.player?.setPos(new Position(i, j));
						break;
					}
				}
			}
		}
		this.removeDuplicateKeyItems();
	}

	// Entities & Items
	public addEntity(entity: Entity): void {
		this.entities.push(entity);
	}
	public addItem(item: Item): void {
		this.items.push(item);
	}
	public processEntities(): void {
		this.entities.forEach((entity) => entity.act());
		this.playersTurn = true;
	}
	public removeEntity(e: Entity, removeFromField = false): void {
		this.entities = this.entities.filter((entity) => {
			if (entity == e) {
				if (removeFromField) this.mapManager.getField().cellAt(e.getPos()).setEntity(null);
				return false;
			}
			return true;
		});
	}
	public removeItem(i: Item, removeFromField = false): void {
		this.items = this.items.filter((item) => {
			if (item == i) {
				if (removeFromField) this.mapManager.getField().cellAt(i.getPos()).setItem(null);
				return false;
			}
			return true;
		});
	}
	public removeItemByName(name: string, removeFromField = false): void {
		this.items = this.items.filter((item) => {
			if (item.getName() == name) {
				if (removeFromField) this.mapManager.getField().cellAt(item.getPos()).setItem(null);
				return false;
			}
			return true;
		});
	}
	public removeDuplicateKeyItems(name?: string): void {
		if (name) this.removeItemByName(name, true);
		else
			this.player?.getKeyItems().forEach((name) => {
				this.removeItemByName(name, true);
			});
	}
	private getRandEnemySound(): [string, number] {
		const enemies = this.entities.filter((e) => e instanceof Enemy);
		if (enemies.length === 0) return ['', 0];
		const enemy = <Enemy>enemies[Math.floor(Math.random() * enemies.length)];
		return [
			enemy.getSound(),
			1 / Math.min(Math.max(1, enemy.getPos().dist(this.player!.getPos()) / 4), 5),
		];
	}
	public getEntities(): Entity[] {
		return this.entities!;
	}
	public setObjects(entities: Entity[], items: Item[], player: Player): void {
		this.clearMap();
		this.entities = entities;
		this.items = items;
		this.player = player;
		this.setPlayer(player.getPos());
		initStartRules();
	}

	// Events
	public pushEvent(e: GameEvent): void {
		this.events.push(e);
	}
	public clearEvents(): void {
		this.events.length = 0;
	}
	public getEvents(): GameEvent[] {
		return this.events;
	}

	// Rules
	public addRule(rule: GameRule, start = true): void {
		if (start) this.startRules.push(rule);
		else this.finishRules.push(rule);
	}
	public getRules(start = true): GameRule[] {
		return start ? this.startRules : this.finishRules;
	}
	public clearRules(start = true): void {
		if (start) this.startRules.length = 0;
		else this.finishRules.length = 0;
	}

	// Misc
	public getMenu(): Menu {
		return this.menu!;
	}
	public getDialogue(): Dialogue {
		return this.dialogue!;
	}
	public getSaveManager(): SaveManager {
		return this.saveManager!;
	}
	public getController(): EventManager {
		return this.eventManager!;
	}
	public getStorage(): ObjectStorage {
		return this.objectStorage!;
	}
	public getSpriteManager(): SpriteManager {
		return this.spriteManager!;
	}
	public getMapManager(): MapManager {
		return this.mapManager;
	}
	public getAudioManager(): AudioManager {
		return this.audioManager;
	}
	public msg(str: string): void {
		console.log(str);
	}
	public changeScale(delta: number): void {
		this.drawManager?.changeScale(this.drawManager.getScale() + delta);
	}

	// Actions
	public performAction(action: ACTION): void {
		switch (action) {
			case ACTION.MOVE:
				this.player!.move(this.eventManager!.getDirection()!);
				break;
			case ACTION.HIT:
				this.player!.hit(this.eventManager!.getDirection()!);
				break;
			case ACTION.CAST:
				this.player!.castSpell(this.eventManager!.getDirection()!);
				break;
			case ACTION.SLEEP:
				this.player!.sleep();
				this.drawManager!.playerRest();
				break;
			case ACTION.PICK_UP:
				this.player!.pickUp();
				this.drawManager!.playerDrop();
				break;
			case ACTION.BUFF:
				this.player!.drinkPotion();
				this.drawManager!.playerDrink();
				break;
			case ACTION.DROP_W:
				this.player!.dropWeapon();
				this.drawManager!.playerDrop();
				break;
			case ACTION.DROP_S:
				this.player!.dropSpell();
				this.drawManager!.playerDrop();
				break;
			case ACTION.DROP_A:
				this.player!.dropArmor();
				this.drawManager!.playerDrop();
				break;
			case ACTION.DROP_P:
				this.player!.dropPotion();
				this.drawManager!.playerDrop();
				break;
			case ACTION.END:
				this.endGame();
				break;
			case ACTION.QSAVE:
				this.msg('Quick saving...');
				this.saveManager!.save(0);
				break;
			case ACTION.QLOAD:
				this.msg('Quick loading...');
				this.saveManager!.load(0);
				break;
			default:
				break;
		}
	}
}
