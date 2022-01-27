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
	public readEnemies(): void {}
	public readItems(): void {}

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
		return true;
	}
	public checkEnemy(key: string): Boolean {
		return true;
	}
	public checkItem(key: string): Boolean {
		return true;
	}
}
