import { Game } from './Game';
import { EnemyBuilder } from './Builders/EnemyBuilder';
import { ItemBuilder } from './Builders/ItemBuilder';
import { NPCBuilder } from './Builders/NPCbuilder';
import { Item } from './Objects/Item';
import { Enemy } from './Objects/Enemy';
import { NPC } from './Objects/NPC';

export class ObjectStorage {
	private enemies = new Map<string, Enemy>();
	private npcs = new Map<string, NPC>();
	private items = new Map<string, Item>();

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
	public getEnemies(): Map<string, Enemy> {
		return this.enemies;
	}
	public getNPCs(): Map<string, NPC> {
		return this.npcs;
	}
	public getItems(): Map<string, Item> {
		return this.items;
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
