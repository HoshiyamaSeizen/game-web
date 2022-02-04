import { Item, Weapon, pType, Spell, Potion, Armor, KeyItem } from './../Objects/Item';
import { Sprite } from './../Storage';
import { Builder } from './Builder';

import items from '../../public/data/items.json';
import { Position } from '../Positioning';

export class ItemBuilder implements Builder {
	private item: Item;
	constructor() {
		this.item = new Weapon();
	}
	public newWeapon(damage = 1, cost = 1, durability = 10): void {
		this.item = new Weapon(damage, cost, durability);
	}
	public newSpell(damage = 1, cost = 1, charges = 1): void {
		this.item = new Spell(damage, cost, charges);
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

		if (itemInfo.type == 'weapon') this.newWeapon(itemInfo.dam, itemInfo.cost, itemInfo.dur);
		else if (itemInfo.type == 'spell')
			this.newSpell(itemInfo.dam, itemInfo.cost, itemInfo.charges);
		else if (itemInfo.type == 'armor') this.newArmor(itemInfo.armor, itemInfo.dur);
		else if (itemInfo.type == 'potion') {
			let type =
				itemInfo.pType == 'HP' ? pType.HP : itemInfo.pType == 'MP' ? pType.MP : pType.SP;
			this.newPotion(type, itemInfo.amount);
		} else if (itemInfo.type == 'key') this.newKeyItem();

		this.setName(itemInfo.name);
		this.setCost(itemInfo.money);

		let image = new Image();
		image.src = `Assets/objects/items/${itemInfo.name}.png`;
		this.setSprite({ source: image, pos: new Position(0, 0) });

		image = new Image();
		if (itemInfo.type == 'weapon' || itemInfo.type == 'spell') {
			image.src = `Assets/objects/items/tool/${itemInfo.name}.png`;
			this.setUSprite({ source: image, pos: new Position(0, 0) });
		} else if (itemInfo.type == 'armor') {
			image.src = `Assets/objects/items/armor/${itemInfo.name}.png`;
			this.setUSprite({ source: image, pos: new Position(0, 0) });
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
