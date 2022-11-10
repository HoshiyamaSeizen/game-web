import { Item, Weapon, pType, Spell, Potion, Armor, KeyItem } from './../Objects/Item';
import { Builder } from './Builder';

import items from '../../public/data/items.json';
import { SpriteManager, Sprite } from '../Managers/SpriteManager';
import { Game } from '../Game';

export class ItemBuilder implements Builder {
	private item: Item;
	private spriteManager: SpriteManager;
	constructor() {
		this.item = new Weapon();
		this.spriteManager = Game.getInstance().getSpriteManager();
	}
	public newWeapon(damage = 1, cost = 1, durability = 10, sound = ''): void {
		this.item = new Weapon(damage, cost, durability, sound);
	}
	public newSpell(damage = 1, cost = 1, charges = 1, sound = ''): void {
		this.item = new Spell(damage, cost, charges, sound);
	}
	public newPotion(type = pType.HP, amount = 50): void {
		this.item = new Potion(type, amount);
	}
	public newArmor(armor = 1, durability = 10): void {
		this.item = new Armor(armor, durability);
	}
	public newKeyItem(): void {
		this.item = new KeyItem();
	}
	public setName(name: string): void {
		this.item.changeName(name);
	}
	public setCost(cost: number): void {
		this.item.setMoneyCost(cost);
	}
	public setSprite(sprite: Sprite): void {
		this.item.setSprite(sprite);
	}
	public setUSprite(sprite: Sprite): void {
		this.item.setUSprite(sprite);
	}
	public buildPresetItem(name: string): void {
		let itemInfo = items.find((item) => item.name == name)!;

		if (itemInfo.type == 'weapon')
			this.newWeapon(itemInfo.dam, itemInfo.cost, itemInfo.dur, itemInfo.sound);
		else if (itemInfo.type == 'spell')
			this.newSpell(itemInfo.dam, itemInfo.cost, itemInfo.charges, itemInfo.sound);
		else if (itemInfo.type == 'armor') this.newArmor(itemInfo.armor, itemInfo.dur);
		else if (itemInfo.type == 'potion') {
			let type =
				itemInfo.pType == 'HP' ? pType.HP : itemInfo.pType == 'MP' ? pType.MP : pType.SP;
			this.newPotion(type, itemInfo.amount);
		} else if (itemInfo.type == 'key') this.newKeyItem();

		this.setName(itemInfo.name);
		this.setCost(itemInfo.money);

		this.setSprite(this.spriteManager.getSprite(itemInfo.name));

		if (itemInfo.type == 'weapon' || itemInfo.type == 'spell' || itemInfo.type == 'armor') {
			this.setUSprite(this.spriteManager.getSprite(`${itemInfo.name}.anim`));
		}
	}

	public getPresetItem(name: string): Item {
		this.buildPresetItem(name);
		return this.getItem();
	}
	public getItem(): Item {
		let resultItem = this.item;
		this.reset();
		return resultItem;
	}
	public reset(): void {
		this.item = new Weapon();
	}
	public getItemList() {
		let itemList: string[] = [];
		items.forEach((item) => {
			itemList.push(item.name);
		});
		return itemList;
	}
}
