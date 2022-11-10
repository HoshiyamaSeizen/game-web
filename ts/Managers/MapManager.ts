import { Transition } from '../Map/Cell';
import { initStartRules, parseRules } from '../Rules/RuleChecker';
import { Game } from '../Game';
import { ObjectStorage } from '../Storage';
import { Position } from '../Positioning';
import { Entity } from '../Objects/Entity';
import { Field } from '../Map/Field';
import { Item } from '../Objects/Item';
import { State } from '../Map/Cell';

import maps from '../../public/data/maps.json';

export class MapManager {
	private field = new Field();
	private image = new Image();
	private currentMap = 'map1';

	public readTiles(): Promise<void> {
		this.image = new Image();
		return new Promise((resolve, reject) => {
			this.image.onload = () => resolve();
			this.image.src = 'assets/tilesheet.png';
		});
	}

	public loadMap(currentMap = this.currentMap, playerPos?: Position): void {
		const game = Game.getInstance();
		game.clearMap();

		this.currentMap = currentMap;
		this.parseMap(currentMap, game.getStorage());

		game.setPlayer(playerPos);
		initStartRules();
	}

	public parseMap(name: string, assets: ObjectStorage, fromSave = false): void {
		this.field = new Field();
		let map = maps.find((m) => m.name === name)!;
		this.setSize(map.width, map.height);
		const objects = map.layers.find((layer) => layer.name === 'ObjectLayer')!.objects!;

		if (!fromSave) {
			// Entities and items
			const enemies = objects.filter((obj) => obj.class === 'Enemy');
			enemies.forEach((obj) => {
				this.setEntity(
					assets.getEnemies().get(obj.name)!.clone(),
					new Position(obj.x / map.tilewidth, obj.y / map.tilewidth)
				);
			});

			const npcs = objects.filter((obj) => obj.class === 'NPC');
			npcs.forEach((obj) => {
				this.setEntity(
					assets.getNPCs().get(obj.name)!.clone(),
					new Position(obj.x / map.tilewidth, obj.y / map.tilewidth)
				);
			});

			const items = objects.filter((obj) => obj.class === 'Item');
			items.forEach((obj) => {
				this.setItem(
					assets.getItems().get(obj.name)!.clone(),
					new Position(obj.x / map.tilewidth, obj.y / map.tilewidth)
				);
			});
		}
		// Transitions
		const transitions = objects.filter((obj) => obj.class === 'Transition');
		transitions.forEach((transition) => {
			const props = transition.properties;
			this.setFinish(
				new Position(transition.x / map.tilewidth, transition.y / map.tilewidth),
				props ? JSON.parse(props.find((prop) => prop.name === 'transition')!.value) : null
			);
		});

		// Walls
		const walls = map.layers.find((layer) => layer.name === 'Walls')!.data!;
		walls.forEach((tile, i) => {
			if (tile)
				this.toggleCellAccessibility(new Position(i % map.width, Math.floor(i / map.width)));
		});

		// Start position
		const startRaw = map.properties.find((property) => property.name === 'start')?.value;
		if (startRaw) {
			const start: number[] = JSON.parse(startRaw);
			this.setStart(new Position(start[0], start[1]));
		}

		// Rules
		Game.getInstance().clearRules(true);
		Game.getInstance().clearRules(false);

		const startRules: string[] = JSON.parse(
			map.properties.find((property) => property.name === 'startRules')!.value
		);
		const finishRules: string[] = JSON.parse(
			map.properties.find((property) => property.name === 'finishRules')!.value
		);

		startRules.forEach((rule) => parseRules(rule.split('.')));
		finishRules.forEach((rule) => parseRules(rule.split('.')));

		// Textures
		const tiles = map.layers.find((layer) => layer.name === 'TileLayer')!.data!;
		const tilesheetWidth = this.image.width / map.tilewidth;
		const tilesheetHeight = this.image.height / map.tilewidth;
		tiles.forEach((el, i) => {
			this.setTilePos(
				new Position(i % map.width, Math.floor(i / map.width)),
				new Position((el - 1) % tilesheetWidth, Math.floor((el - 1) / tilesheetHeight))
			);
		});

		// Music
		const audio = map.properties.find((property) => property.name === 'audio')!.value;
		Game.getInstance().getAudioManager().setBackground(audio);
	}
	public getField(): Field {
		return this.field;
	}
	public getCurrentMap(): string {
		return this.currentMap!;
	}
	public getTileSheet(): HTMLImageElement {
		return this.image;
	}

	public setSize(width: number, height: number): void {
		this.field = new Field(width, height);
	}
	public toggleCellAccessibility(pos: Position): void {
		if (this.field.cellAt(pos).isAccessible()) this.field.cellAt(pos).toggleAccessibility();
	}
	public setStart(pos: Position): void {
		for (let i = 0; i < this.field.getWidth(); i++) {
			for (let j = 0; j < this.field.getHeigth(); j++) {
				if (this.field.cellAt(pos).isStart()) this.field.cellAt(pos).setState(State.normal);
			}
		}
		this.field.cellAt(pos).setState(State.start);
	}
	public setFinish(pos: Position, transition?: Transition): void {
		this.field.cellAt(pos).setState(State.finish);
		if (transition) this.field.cellAt(pos).setTransition(transition);
	}
	public setEntity(ent: Entity, pos: Position): void {
		this.field.cellAt(pos).setEntity(ent);
		ent.setPos(pos);
		Game.getInstance().addEntity(ent);
	}
	public setItem(item: Item, pos: Position): void {
		this.field.cellAt(pos).setItem(item);
		item.setPos(pos);
		Game.getInstance().addItem(item);
	}
	public canItemBeSet(pos: Position): Boolean {
		return this.field.isInField(pos) && !this.field.cellAt(pos).hasItem();
	}
	public canEntityBeSet(pos: Position): Boolean {
		return this.field.isInField(pos) && this.field.cellAt(pos).isFree();
	}
	public setTilePos(mapPos: Position, tilePos: Position): void {
		this.field.cellAt(mapPos).setTilePos(tilePos);
	}
}
