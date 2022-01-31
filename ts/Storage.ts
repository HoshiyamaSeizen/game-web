import { EnemyBuilder } from './Builders/EnemyBuilder';
import { ItemBuilder } from './Builders/ItemBuilder';
import { Position } from './Positioning';
import { Item } from './Objects/Item';
import { Enemy } from './Objects/Enemy';

import tilesheetList from '../public/assets/tilesheets/tilesheets.json';

export type Sprite = {
	source: HTMLImageElement;
	pos: Position;
};

export class AssetStorage {
	private tilesheets = new Map<string, HTMLImageElement>();
	private enemies = new Map<string, Enemy>();
	private items = new Map<string, Item>();

	public readTilesheets(): void {
		console.log('Reading tilesheets:');
		let image: HTMLImageElement;
		tilesheetList.forEach((tilesheetName) => {
			image = new Image();
			image.src = `../public/assets/tilesheets/${tilesheetName}.png`;
			this.tilesheets.set(tilesheetName, image);
			console.log(`\t${tilesheetName}`);
		});
		console.log('\n');
	}
	public readEnemies(): void {
		let ebuilder = new EnemyBuilder();
		console.log('Reading enemies: ');
		ebuilder.getEnemyList().forEach((name) => {
			this.enemies.set(name, ebuilder.getPresetEnemy(name));
			console.log(`\t${name}`);
		});
		console.log('\n');
	}
	public readItems(): void {
		let ibuilder = new ItemBuilder();
		console.log('Reading items: ');
		ibuilder.getItemList().forEach((name) => {
			this.items.set(name, ibuilder.getPresetItem(name));
			console.log(`\t${name}`);
		});
		console.log('\n');
	}

	public getTilesheets(): Map<string, HTMLImageElement> {
		return this.tilesheets;
	}
	public getEnemies(): Map<string, Enemy> {
		return this.enemies;
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
	public checkItem(key: string): Boolean {
		return this.items.has(key);
	}
}
