import { Enemy } from './Objects/Enemy';
import { FieldBuilder } from './Builders/FieldBuilder';
import { Position } from './Positioning';
import { Drawer } from './Drawer';
import { Controller, ACTION } from './Controller';
import { SaveManager } from './SaveManager';
import { AssetStorage } from './Storage';
import { GameEvent } from './Event';
import { Item } from './Objects/Item';
import { Entity } from './Objects/Entity';
import { Player } from './Objects/Player';
import { Field } from './Map/Field';

export class Game {
	private static instance: Game | null = null;
	private constructor() {
		this.player = null;
		this.playersTurn = true;
		this.gameActive = false;
		this.entities = [];
		this.items = [];
		this.events = [];
		this.move = 0;
	}

	private gameActive: Boolean;
	private playersTurn: Boolean;
	private currentMap: string | null = null;
	private builder: FieldBuilder | null = null;
	private field: Field | null = null;
	private player: Player | null = null;
	private entities: Entity[];
	private items: Item[];
	private events: GameEvent[];
	private assets: AssetStorage | null = null;
	private saveManager: SaveManager | null = null;
	// private logger: Logger
	private controller: Controller | null = null;
	private drawer: Drawer | null = null;
	private move: number;

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
	public isPlayersTurn(): Boolean {
		return this.playersTurn;
	}
	public loadMap(): void {
		this.field = this.builder!.getPresetMap(this.currentMap!, this.assets!);
		this.setPlayer();
		//TODO: Rules
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

		this.field = field;
		this.entities = entities;
		this.items = items;
		this.player = player;

		this.setPlayerPos(player.getPos());
		//TODO: Rules
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
			// case ACTION.QSAVE:
			// 	msg("Quick saving...");
			// 	saveManager.save("_qsave", currentMap);
			// 	break;
			// case ACTION.QLOAD:
			// 	msg("Quick loading...");
			// 	saveManager.load("_qsave");
			// 	break;
			default:
				break;
		}
	}
	public start(): void {
		if (this.gameActive) return;
		else this.gameActive = true;

		this.controller = new Controller();
		this.drawer = new Drawer();
		this.saveManager = new SaveManager();
		this.builder = new FieldBuilder();

		// Resize canvas when window resizes
		this.drawer.addResizeListener();

		// Read Tilesheets, Enemies & Items
		this.assets = new AssetStorage();
		this.assets.readTilesheets();
		this.assets.readEnemies();
		this.assets.readItems();

		// Init Player
		this.player = new Player();
		this.drawer.setPlayerSprite();

		// Load Map and set Player
		this.currentMap = 'map1';
		this.loadMap();

		//TODO: check save

		// Life Cycle
		let prevTimestamp = 0;
		let elapsed: number;
		const step = (timestamp: number) => {
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
	public setPlayer(): void {
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
	public setPlayerPos(pos: Position): void {
		this.field?.cellAt(pos).setEntity(this.player!);
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
	public removeEntity(e: Entity): void {
		this.entities = this.entities.filter((entity) => entity != e);
	}
	public removeItem(i: Item): void {
		this.items = this.items.filter((item) => item != i);
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

	public pushEvent(e: GameEvent): void {
		this.events.push(e);
	}
	public clearEvents(): void {
		this.events.length = 0;
	}
	public getEvents(): GameEvent[] {
		return this.events;
	}

	// Misc
	public changeScale(delta: number): void {
		this.drawer?.changeScale(this.drawer.getScale() + delta);
	}
}
