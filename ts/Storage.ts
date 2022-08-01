import { Game } from './Game';
import { EnemyBuilder } from './Builders/EnemyBuilder';
import { ItemBuilder } from './Builders/ItemBuilder';
import { NPCBuilder } from './Builders/NPCbuilder';
import { Position } from './Positioning';
import { Item } from './Objects/Item';
import { Enemy } from './Objects/Enemy';
import { NPC } from './Objects/NPC';

import tilesheetList from '../public/assets/tilesheets/tilesheets.json';

export type Sprite = {
	source: HTMLImageElement;
	pos: Position;
};

export class AssetStorage {
	private tilesheets = new Map<string, HTMLImageElement>();
	private enemies = new Map<string, Enemy>();
	private npcs = new Map<string, NPC>();
	private items = new Map<string, Item>();

	public readTilesheets(): void {
		Game.getInstance().msg('Reading tilesheets: ');
		let image: HTMLImageElement;
		tilesheetList.forEach((tilesheetName) => {
			image = new Image();
			image.src = `assets/tilesheets/${tilesheetName}.png`;
			this.tilesheets.set(tilesheetName, image);
			Game.getInstance().msg(`\t${tilesheetName}`);
		});
		Game.getInstance().msg('\n');
	}
	public readEnemies(): void {
		let ebuilder = new EnemyBuilder();
		Game.getInstance().msg('Reading enemies: ');
		ebuilder.getEnemyList().forEach((name) => {
			this.enemies.set(name, ebuilder.getPresetEnemy(name));
			Game.getInstance().msg(`\t${name}`);
		});
		Game.getInstance().msg('\n');
	}
	public readNPCs(): void {
		let nbuilder = new NPCBuilder();
		Game.getInstance().msg('Reading NPCs: ');
		nbuilder.getNPCList().forEach((name) => {
			this.npcs.set(name, nbuilder.getPresetNPC(name));
			Game.getInstance().msg(`\t${name}`);
		});
		Game.getInstance().msg('\n');
	}
	public readItems(): void {
		let ibuilder = new ItemBuilder();
		Game.getInstance().msg('Reading items: ');
		ibuilder.getItemList().forEach((name) => {
			this.items.set(name, ibuilder.getPresetItem(name));
			Game.getInstance().msg(`\t${name}`);
		});
		Game.getInstance().msg('\n');
	}

	public getTilesheets(): Map<string, HTMLImageElement> {
		return this.tilesheets;
	}
	public getEnemies(): Map<string, Enemy> {
		return this.enemies;
	}
	public getNPCs(): Map<string, NPC> {
		return this.npcs;
	}
	public getItems(): Map<string, Item> {
		return this.items;
	}

	public checkTexture(key: string): Boolean {
		return this.tilesheets.has(key);
	}
	public checkEnemy(key: string): Boolean {
		return this.enemies.has(key);
	}
	public checkNPC(key: string): Boolean {
		return this.npcs.has(key);
	}
	public checkItem(key: string): Boolean {
		return this.items.has(key);
	}
}
