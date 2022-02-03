import { Condition } from './../Rules/GameRule';
import { eType, sourceType, GameEvent } from './../Event';
import { Game } from './../Game';
import { GameObject } from './Object';

export interface Item extends GameObject {
	changeName(name: string): void;
	changeStat(stat: Condition, value: number): void;
	getName(): string;
	getDur(): number;
	setDur(num: number): void;
	setMoneyCost(cost: number): void;
	getMoneyCost(): number;
	decreaseDur(): void;
	clone(): Item;
}

export class Weapon extends GameObject implements Item {
	private damage: number;
	private cost: number;
	private durability: number;
	private name: string;
	private moneyCost = 0;

	constructor(damage = 1, cost = 1, durability = 10) {
		super();
		this.damage = damage;
		this.cost = cost;
		this.durability = durability;
		this.name = 'Weapon';
	}
	public getName(): string {
		return this.name;
	}
	public getDamage(): number {
		return this.damage;
	}
	public getCost(): number {
		return this.cost;
	}
	public changeStat(stat: Condition, value: number): void {
		switch (stat) {
			case Condition.DAM:
				this.damage = value;
				break;
			case Condition.COST:
				this.cost = value;
				break;
			case Condition.DUR:
				this.durability = value;
				break;
			case Condition.PRICE:
				this.moneyCost = value;
			default:
				break;
		}
	}
	public getDur(): number {
		return this.durability;
	}
	public setDur(num: number): void {
		this.durability = num;
	}
	public setMoneyCost(cost: number): void {
		this.moneyCost = cost;
	}
	public getMoneyCost(): number {
		return this.moneyCost;
	}

	public decreaseDur(): void {
		this.durability--;
		if (this.durability <= 0) {
			Game.getInstance().pushEvent(new GameEvent(sourceType.ITEM, eType.breakEvent, this.name));
			Game.getInstance().getPlayer().setWeapon(null);
			Game.getInstance().removeItem(this);
		}
	}
	public changeName(name: string): void {
		this.name = name;
	}
	public clone(): Item {
		let item = new Weapon(this.damage, this.cost, this.durability);
		item.name = this.name;
		item.sprite = this.sprite;
		item.spriteWhenUsed = this.spriteWhenUsed;
		return item;
	}
}

export class Spell extends GameObject implements Item {
	private damage: number;
	private cost: number;
	private charges: number;
	private name: string;
	private moneyCost = 0;

	constructor(damage = 1, cost = 1, charges = 1) {
		super();
		this.damage = damage;
		this.cost = cost;
		this.charges = charges;
		this.name = 'Spell';
	}
	public getName(): string {
		return this.name;
	}
	public getDamage(): number {
		return this.damage;
	}
	public getCost(): number {
		return this.cost;
	}
	public changeStat(stat: Condition, value: number): void {
		switch (stat) {
			case Condition.DAM:
				this.damage = value;
				break;
			case Condition.COST:
				this.cost = value;
				break;
			case Condition.DUR:
				this.charges = value;
				break;
			case Condition.PRICE:
				this.moneyCost = value;
			default:
				break;
		}
	}
	public getDur(): number {
		return this.charges;
	}
	public setDur(num: number): void {
		this.charges = num;
	}
	public setMoneyCost(cost: number): void {
		this.moneyCost = cost;
	}
	public getMoneyCost(): number {
		return this.moneyCost;
	}

	public decreaseDur(): void {
		this.charges--;
		if (this.charges <= 0) {
			Game.getInstance().pushEvent(
				new GameEvent(sourceType.ITEM, eType.noChargesEvent, this.name)
			);
			Game.getInstance().getPlayer().setSpell(null);
			Game.getInstance().removeItem(this);
		}
	}
	public changeName(name: string): void {
		this.name = name;
	}
	public clone(): Item {
		let item = new Spell(this.damage, this.cost, this.charges);
		item.name = this.name;
		item.sprite = this.sprite;
		item.spriteWhenUsed = this.spriteWhenUsed;
		return item;
	}
}

export class Armor extends GameObject implements Item {
	private armor: number;
	private durability: number;
	private name: string;
	private moneyCost = 0;

	constructor(armor = 1, durability = 10) {
		super();
		this.armor = armor;
		this.durability = durability;
		this.name = 'Armor';
	}
	public getName(): string {
		return this.name;
	}
	public getArmor(): number {
		return this.armor;
	}
	public changeStat(stat: Condition, value: number): void {
		switch (stat) {
			case Condition.DEF:
				this.armor = value;
				break;
			case Condition.DUR:
				this.durability = value;
				break;
			case Condition.PRICE:
				this.moneyCost = value;
			default:
				break;
		}
	}
	public getDur(): number {
		return this.durability;
	}
	public setDur(num: number): void {
		this.durability = num;
	}
	public setMoneyCost(cost: number): void {
		this.moneyCost = cost;
	}
	public getMoneyCost(): number {
		return this.moneyCost;
	}

	public decreaseDur(): void {
		this.durability--;
		if (this.durability <= 0) {
			Game.getInstance().pushEvent(new GameEvent(sourceType.ITEM, eType.breakEvent, this.name));
			Game.getInstance().getPlayer().setArmor(null);
			Game.getInstance().removeItem(this);
		}
	}
	public changeName(name: string): void {
		this.name = name;
	}
	public clone(): Item {
		let item = new Armor(this.armor, this.durability);
		item.name = this.name;
		item.sprite = this.sprite;
		item.spriteWhenUsed = this.spriteWhenUsed;
		return item;
	}
}

export enum pType {
	HP,
	SP,
	MP,
}
export class Potion extends GameObject implements Item {
	private name: string;
	private amount: number;
	private type: pType;
	private moneyCost = 0;

	constructor(type = pType.HP, amount = 50) {
		super();
		this.type = type;
		this.amount = amount;
		this.name = 'Potion';
	}
	public getName(): string {
		return this.name;
	}
	public getType(): pType {
		return this.type;
	}
	public getAmount(): number {
		return this.amount;
	}
	public changeStat(stat: Condition, value: number): void {
		switch (stat) {
			case Condition.HP:
				this.type = pType.HP;
				this.amount = value;
				break;
			case Condition.MP:
				this.type = pType.MP;
				this.amount = value;
				break;
			case Condition.SP:
				this.type = pType.SP;
				this.amount = value;
				break;
			case Condition.PRICE:
				this.moneyCost = value;
			default:
				break;
		}
	}
	public getDur(): number {
		return 1;
	}
	public setDur(num: number): void {
		return;
	}
	public setMoneyCost(cost: number): void {
		this.moneyCost = cost;
	}
	public getMoneyCost(): number {
		return this.moneyCost;
	}

	public decreaseDur(): void {
		Game.getInstance().getPlayer().setPotion(null);
		Game.getInstance().removeItem(this);
	}
	public changeName(name: string): void {
		this.name = name;
	}
	public clone(): Item {
		let item = new Potion(this.type, this.amount);
		item.name = this.name;
		item.sprite = this.sprite;
		item.spriteWhenUsed = this.spriteWhenUsed;
		return item;
	}
}
