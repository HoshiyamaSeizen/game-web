import { Dialogue } from './Dialogue';
import { initStartRules } from './Rules/RuleChecker';
import { GameRule } from './Rules/GameRule';
import { Enemy } from './Objects/Enemy';
import { FieldBuilder } from './Builders/FieldBuilder';
import { Position, changePos } from './Positioning';
import { Drawer } from './Drawer';
import { Controller, ACTION } from './Controller';
import { SaveManager } from './SaveManager';
import { AssetStorage } from './Storage';
import { GameEvent } from './Event';
import { Item, KeyItem } from './Objects/Item';
import { Entity } from './Objects/Entity';
import { Player } from './Objects/Player';
import { Field } from './Map/Field';
import { Menu } from './Menu';

export class Game {
	private static instance?: Game;
	private constructor() {
		this.playersTurn = true;
		this.gameActive = false;
		this.entities = [];
		this.items = [];
		this.events = [];
		this.startRules = [];
		this.finishRules = [];
		this.move = 0;
		this.gameStarted = false;
	}

	private gameStarted: Boolean;
	private gameActive: Boolean;
	private playersTurn: Boolean;
	private currentMap?: string;
	private builder?: FieldBuilder;
	private field?: Field;
	private player?: Player;
	private entities: Entity[];
	private items: Item[];
	private events: GameEvent[];
	private assets?: AssetStorage;
	private saveManager?: SaveManager;
	private menu?: Menu;
	private dialogue?: Dialogue;
	private controller?: Controller;
	private drawer?: Drawer;
	private move: number;
	private startRules: GameRule[];
	private finishRules: GameRule[];

	public static getInstance(): Game {
		if (!this.instance) this.instance = new Game();
		return this.instance;
	}

	// Game Process
	public getMove(): number {
		return this.move;
	}
	public endGame(): void {
		this.gameActive = false;
	}
	public playerActed(): void {
		this.clearEvents();
		this.drawer?.clearPlayerAction();
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
	public isPlayersTurn(): Boolean {
		return this.playersTurn;
	}
	public loadMap(currentMap = this.currentMap, playerPos?: Position): void {
		this.clearEvents();
		this.clearEntities();
		this.clearItems();
		this.clearRules();

		this.currentMap = currentMap;
		this.field = this.builder!.getPresetMap(currentMap!, this.assets!);
		this.setPlayer(playerPos);
		initStartRules();
	}
	public setMap(
		name: string,
		field: Field,
		entities: Entity[],
		items: Item[],
		player: Player
	): void {
		this.currentMap = name;
		this.clearEvents();
		this.clearEntities();
		this.clearItems();
		this.clearRules();

		this.field = field;
		this.entities = entities;
		this.items = items;
		this.player = player;

		this.setPlayer(player.getPos());
		initStartRules();
	}
	public performAction(action: ACTION): void {
		switch (action) {
			case ACTION.MOVE:
				this.player!.move(this.controller!.getDirection()!);
				break;
			case ACTION.HIT:
				this.player!.hit(this.controller!.getDirection()!);
				break;
			case ACTION.CAST:
				this.player!.castSpell(this.controller!.getDirection()!);
				break;
			case ACTION.SLEEP:
				this.player!.sleep();
				this.drawer!.playerRest();
				break;
			case ACTION.PICK_UP:
				this.player!.pickUp();
				this.drawer!.playerDrop();
				break;
			case ACTION.BUFF:
				this.player!.drinkPotion();
				this.drawer!.playerDrink();
				break;
			case ACTION.DROP_W:
				this.player!.dropWeapon();
				this.drawer!.playerDrop();
				break;
			case ACTION.DROP_S:
				this.player!.dropSpell();
				this.drawer!.playerDrop();
				break;
			case ACTION.DROP_A:
				this.player!.dropArmor();
				this.drawer!.playerDrop();
				break;
			case ACTION.DROP_P:
				this.player!.dropPotion();
				this.drawer!.playerDrop();
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
	public start(): void {
		if (this.gameActive) return;
		else this.gameActive = true;

		// Open Menu
		this.menu = new Menu();

		this.controller = new Controller();
		this.drawer = new Drawer();
		this.saveManager = new SaveManager();
		this.builder = new FieldBuilder();
		this.saveManager = new SaveManager();
		this.dialogue = new Dialogue();

		// Resize canvas when window resizes
		this.drawer.addResizeListener();

		// Read Tilesheets, Enemies & Items
		this.assets = new AssetStorage();
		this.assets.readTilesheets();
		this.assets.readEnemies();
		this.assets.readNPCs();
		this.assets.readItems();

		// Init Player
		this.player = new Player();
		this.drawer.setPlayerSprite();

		// Load Map and set Player
		this.currentMap = 'map1';
		this.loadMap();

		// Life Cycle
		let prevTimestamp = 0;
		let elapsed: number;
		const step = (timestamp: number) => {
			if (!this.menu!.opened()) {
				// if(!this.isActive()) ...
				if (!this.playersTurn) {
					this.processEntities();
				} else if (this.controller!.hasAction()) {
					this.performAction(this.controller!.getAction()!);
					this.controller?.clearActions();
				}

				elapsed = timestamp - prevTimestamp;
				if (elapsed >= 1000) {
					this.drawer?.toggleAnimFrame();
					prevTimestamp = timestamp;
				}

				// Draw
				this.drawer!.clear();
				this.drawer!.drawField(this.field!);
				this.drawer!.drawInfo();
				this.drawer!.drawLog();
				this.drawer!.drawDialogue();
			}
			window.requestAnimationFrame(step);
		};
		window.requestAnimationFrame(step);
	}

	// Field & Player
	public getField(): Field {
		return this.field!;
	}
	public getPlayer(): Player {
		return this.player!;
	}
	public getEntities(): Entity[] {
		return this.entities!;
	}
	public getItems(): Item[] {
		return this.items!;
	}
	public setPlayer(pos?: Position): void {
		if (pos) {
			this.field?.cellAt(pos).setEntity(this.player!);
			this.player?.setPos(pos);
		} else {
			for (let i = 0; i < this.field!.getWidth(); i++) {
				for (let j = 0; j < this.field!.getHeigth(); j++) {
					if (this.field?.cellAt(new Position(i, j)).isStart()) {
						this.field.cellAt(new Position(i, j)).setEntity(this.player!);
						this.player?.setPos(new Position(i, j));
						break;
					}
				}
			}
		}

		this.removeDuplicateKeyItems();
	}
	public getStorage(): AssetStorage {
		return this.assets!;
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
		this.move++;
	}
	public clearEntities(): void {
		this.entities.length = 0;
	}
	public clearItems(): void {
		this.items.length = 0;
	}
	public removeEntity(e: Entity, removeFromField = false): void {
		this.entities = this.entities.filter((entity) => {
			if (entity == e) {
				if (removeFromField) this.field?.cellAt(e.getPos()).setEntity(null);
				return false;
			}
			return true;
		});
	}
	public removeItem(i: Item, removeFromField = false): void {
		this.items = this.items.filter((item) => {
			if (item == i) {
				if (removeFromField) this.field?.cellAt(i.getPos()).setItem(null);
				return false;
			}
			return true;
		});
	}
	public removeItemByName(name: string, removeFromField = false): void {
		this.items = this.items.filter((item) => {
			if (item.getName() == name) {
				if (removeFromField) this.field?.cellAt(item.getPos()).setItem(null);
				return false;
			}
			return true;
		});
	}
	public isEntityOnField(e: Entity): Boolean {
		return this.entities.includes(e);
	}
	public countEnemies(): number {
		return this.entities.filter((e) => e instanceof Enemy).length;
	}
	public countItems(): number {
		return this.items.length;
	}
	public removeDuplicateKeyItems(name?: string): void {
		if (name) this.removeItemByName(name, true);
		else
			this.player?.getKeyItems().forEach((name) => {
				this.removeItemByName(name, true);
			});
	}

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
	public getCurrentMap(): string {
		return this.currentMap!;
	}
	public msg(str: string): void {
		console.log(str);
	}
	public changeScale(delta: number): void {
		this.drawer?.changeScale(this.drawer.getScale() + delta);
	}
}
