import { NPC } from './NPC';
import { checkFinishRules } from './../Rules/RuleChecker';
import { eType, sourceType } from './../Event';
import { changePos, Position, findDir } from './../Positioning';
import { Game } from './../Game';
import { Potion, Spell, Armor, Weapon, pType, KeyItem } from './Item';
import { Direction } from '../Positioning';
import { Entity } from './Entity';
import { GameObject } from './Object';
import { GameEvent } from '../Event';
import { Condition } from '../Rules/GameRule';

const MAX_HP_DEFAULT = 1000;
const MAX_MP_DEFAULT = 100;
const MAX_SP_DEFAULT = 100;
const STRENGTH_DEFAULT = 50;

export class Player extends GameObject implements Entity {
	private health: number;
	private mana: number;
	private stamina: number;
	private maxHealth: number;
	private maxMana: number;
	private maxStamina: number;
	private damage: number;
	private money: number;
	private score: number;
	private name: string;
	private weapon: Weapon | null = null;
	private armor: Armor | null = null;
	private spell: Spell | null = null;
	private potion: Potion | null = null;
	private keyItems: string[];
	private game: Game;

	constructor(
		mHealth = MAX_HP_DEFAULT,
		mMana = MAX_MP_DEFAULT,
		mStamina = MAX_SP_DEFAULT,
		damage = STRENGTH_DEFAULT
	) {
		super();
		this.maxHealth = mHealth;
		this.health = mHealth;
		this.maxStamina = mStamina;
		this.stamina = mStamina;
		this.maxMana = mMana;
		this.mana = mMana;
		this.damage = damage;
		this.money = 0;
		this.score = 0;
		this.keyItems = [];
		this.name = 'you';
		this.game = Game.getInstance();
	}

	public changeStat(stat: Condition, value: number): void {
		switch (stat) {
			case Condition.HP:
				this.health = value;
				break;
			case Condition.MHP:
				this.maxHealth = value;
				break;
			case Condition.MP:
				this.mana = value;
				break;
			case Condition.MMP:
				this.maxMana = value;
				break;
			case Condition.SP:
				this.stamina = value;
				break;
			case Condition.MSP:
				this.maxStamina = value;
				break;
			case Condition.DAM:
				this.damage = value;
				break;
			case Condition.MONEY:
				this.money = value;
				break;
			case Condition.SCORE:
				this.score = value;
				break;
			default:
				break;
		}
	}

	public move(dir: Direction): void {
		let newPos = changePos(this.pos, dir);
		this.movePos(newPos);
	}
	public movePos(pos: Position): void {
		let f = this.game.getMapManager().getField();

		if (f.isInField(pos)) {
			if (f.cellAt(pos).isFree()) {
				f.cellAt(this.pos).setEntity(null);
				f.cellAt(pos).setEntity(this);
			} else if (f.cellAt(pos).getEntity() instanceof NPC) {
				let npc = f.cellAt(pos).getEntity()!;
				npc.setPos(this.pos);
				f.cellAt(this.pos).setEntity(npc);
				f.cellAt(pos).setEntity(this);
			} else return;

			this.prevDir = findDir(this.pos, pos);
			this.pos = pos;
			this.game.playerActed();

			if (f.cellAt(this.pos).isFinish()) {
				let transition = f.cellAt(this.pos).getTransition();
				if (
					transition &&
					(!transition.followRules || checkFinishRules()) &&
					(!transition.key || this.keyItems.includes(transition.key))
				) {
					this.game
						.getMapManager()
						.loadMap(transition.map, new Position(transition.x, transition.y));
				} else if (transition && transition.key && !this.keyItems.includes(transition.key)) {
					this.game.pushEvent(
						new GameEvent(sourceType.PLAYER, eType.missingKeyItem, transition.key)
					);
				} else if (checkFinishRules()) {
					this.game.pushEvent(new GameEvent(sourceType.PLAYER, eType.finishEvent));
					this.game.endGame();
				} else this.game.pushEvent(new GameEvent(sourceType.PLAYER, eType.goalsNotMet));
			} else if (f.cellAt(pos).hasItem()) {
				this.game.pushEvent(
					new GameEvent(sourceType.PLAYER, eType.findEvent, f.cellAt(pos).getItem()?.getName())
				);
			}
		}
	}
	public hit(dir: Direction): void {
		let f = this.game.getMapManager().getField();
		let hitPos = changePos(this.pos, dir);

		this.game.getAudioManager().playAudio(this.getWeapon()?.getSound() || 'hitHand', 0.5);

		if (f.isInField(hitPos) && !f.cellAt(hitPos).isFree() && f.cellAt(hitPos).isAccessible()) {
			let ent = f.cellAt(hitPos).getEntity()!;
			this.hitEntity(ent);
		}
	}
	public hitEntity(e: Entity): void {
		if (e instanceof NPC) {
			this.talk(e);
			return;
		}
		let dealedDamage = this.damage + (this.weapon ? this.weapon.getDamage() : 0);
		let requiredSP = 1 + (this.weapon ? this.weapon.getCost() : 0);

		if (this.stamina >= requiredSP) {
			this.stamina -= requiredSP;
			this.prevDir = findDir(this.pos, e.getPos());
			this.game.playerActed();
			this.game.pushEvent(
				new GameEvent(sourceType.PLAYER, eType.hitEvent, this.name, e.getName(), dealedDamage)
			);
			if (this.weapon) this.weapon.decreaseDur();
			e.getHit(dealedDamage);
		}
	}
	public castSpell(dir: Direction): void {
		let f = this.game.getMapManager().getField();
		let dealedDamage = this.spell ? this.spell.getDamage() : 0;
		let requiredMP = this.spell ? this.spell.getCost() : 0;

		if (this.getSpell()) this.game.getAudioManager().playAudio(this.getSpell()!.getSound(), 0.5);

		let hitPos = changePos(this.pos, dir);
		if (f.isInField(hitPos) && !f.cellAt(hitPos).isFree() && f.cellAt(hitPos).isAccessible()) {
			let ent = f.cellAt(hitPos).getEntity()!;
			if (ent instanceof NPC) {
				this.talk(ent);
				return;
			}
			if (this.mana >= requiredMP && this.spell) {
				this.mana -= requiredMP;
				this.prevDir = dir;
				this.game.playerActed();
				this.game.pushEvent(
					new GameEvent(
						sourceType.PLAYER,
						eType.castEvent,
						this.name,
						ent.getName(),
						dealedDamage
					)
				);
				this.spell.decreaseDur();
				ent.getHit(dealedDamage);
			}
		}
	}
	public talk(npc: NPC): void {
		this.game.getDialogue().setTarget(npc);
	}
	public drinkPotion(): void {
		if (this.hasPotion()) {
			let amount = this.potion!.getAmount();
			let type = this.potion!.getType();
			let typeStr = '';

			if (type == pType.HP) {
				this.health =
					this.health + amount >= this.maxHealth ? this.maxHealth : this.health + amount;
				typeStr = 'HP';
			} else if (type == pType.SP) {
				this.stamina =
					this.stamina + amount >= this.maxStamina ? this.maxStamina : this.stamina + amount;
				typeStr = 'SP';
			} else if (type == pType.MP) {
				this.mana = this.mana + amount >= this.maxMana ? this.maxMana : this.mana + amount;
				typeStr = 'MP';
			}
			this.game.playerActed();
			this.game.pushEvent(
				new GameEvent(
					sourceType.PLAYER,
					eType.drinkEvent,
					this.potion!.getName(),
					typeStr,
					amount
				)
			);
			this.potion!.decreaseDur();
			this.game.getAudioManager().playAudio('potion');
		}
	}
	public getHit(damage: number): void {
		let recieved = damage - (this.armor ? Math.round(damage / this.armor.getArmor()) : 0);
		this.health -= recieved;
		if (this.armor) this.armor!.decreaseDur();
		this.game.pushEvent(
			new GameEvent(sourceType.PLAYER, eType.getHitEvent, this.name, '', recieved, this.health)
		);
		if (this.health <= 0) {
			this.game.getMapManager().getField().cellAt(this.pos).setEntity(null);
			this.game.pushEvent(new GameEvent(sourceType.PLAYER, eType.deadEvent, this.name));
			this.game.endGame();
		}
	}
	public sleep(): void {
		this.health += 10;
		if (this.health >= this.maxHealth) this.health = this.maxHealth;
		this.stamina += 10;
		if (this.stamina >= this.maxStamina) this.stamina = this.maxStamina;
		this.mana += 10;
		if (this.mana >= this.maxMana) this.mana = this.maxMana;
		this.game.playerActed();
		this.game.pushEvent(new GameEvent(sourceType.PLAYER, eType.restEvent, '', '', 10));
		this.game.getAudioManager().playAudio('sleep');
	}

	public pickUp(): void {
		let f = this.game.getMapManager().getField()!;
		if (f.cellAt(this.pos).hasItem()) {
			let item = f.cellAt(this.pos).getItem()!;
			if (item.getMoneyCost() > this.money) {
				this.game.playerActed();
				this.game.pushEvent(
					new GameEvent(sourceType.PLAYER, eType.notEnoughMoney, '', '', item.getMoneyCost())
				);
				return;
			}
			this.money -= item.getMoneyCost();
			item.setMoneyCost(0);
			f.cellAt(this.pos).setItem(null);
			this.game.removeItem(item);
			if (item instanceof Weapon) {
				if (this.weapon) this.dropWeapon();
				this.weapon = item;
			} else if (item instanceof Spell) {
				if (this.spell) this.dropSpell();
				this.spell = item;
			} else if (item instanceof Armor) {
				if (this.armor) this.dropArmor();
				this.armor = item;
			} else if (item instanceof Potion) {
				if (this.potion) this.dropPotion();
				this.potion = item;
			} else if (item instanceof KeyItem) {
				this.keyItems.push(item.getName());
				this.game.removeDuplicateKeyItems(item.getName());
			}
			this.game.playerActed();
			this.game.getAudioManager().playAudio('select');
			this.game.pushEvent(new GameEvent(sourceType.PLAYER, eType.pickUpEvent, item.getName()));
		}
	}
	public dropWeapon(): void {
		let f = this.game.getMapManager().getField()!;
		if (!f.cellAt(this.pos).hasItem() && this.weapon) {
			f.cellAt(this.pos).setItem(this.weapon);
			this.weapon.setPos(this.pos);
			this.game.addItem(this.weapon);
			this.game.pushEvent(
				new GameEvent(sourceType.PLAYER, eType.dropEvent, this.weapon.getName())
			);
			this.weapon = null;
			this.game.getAudioManager().playAudio('select');
		}
	}
	public dropSpell(): void {
		let f = this.game.getMapManager().getField()!;
		if (!f.cellAt(this.pos).hasItem() && this.spell) {
			f.cellAt(this.pos).setItem(this.spell);
			this.spell.setPos(this.pos);
			this.game.addItem(this.spell);
			this.game.pushEvent(
				new GameEvent(sourceType.PLAYER, eType.dropEvent, this.spell.getName())
			);
			this.spell = null;
			this.game.getAudioManager().playAudio('select');
		}
	}
	public dropPotion(): void {
		let f = this.game.getMapManager().getField()!;
		if (!f.cellAt(this.pos).hasItem() && this.potion) {
			f.cellAt(this.pos).setItem(this.potion);
			this.potion.setPos(this.pos);
			this.game.addItem(this.potion);
			this.game.pushEvent(
				new GameEvent(sourceType.PLAYER, eType.dropEvent, this.potion.getName())
			);
			this.potion = null;
			this.game.getAudioManager().playAudio('select');
		}
	}
	public dropArmor(): void {
		let f = this.game.getMapManager().getField()!;
		if (!f.cellAt(this.pos).hasItem() && this.armor) {
			f.cellAt(this.pos).setItem(this.armor);
			this.armor.setPos(this.pos);
			this.game.addItem(this.armor);
			this.game.pushEvent(
				new GameEvent(sourceType.PLAYER, eType.dropEvent, this.armor.getName())
			);
			this.armor = null;
			this.game.getAudioManager().playAudio('select');
		}
	}

	public getWeapon(): Weapon | null {
		return this.weapon;
	}
	public getArmor(): Armor | null {
		return this.armor;
	}
	public getSpell(): Spell | null {
		return this.spell;
	}
	public getPotion(): Potion | null {
		return this.potion;
	}
	public getKeyItems(): string[] {
		return this.keyItems;
	}
	public getName(): string {
		return this.name;
	}
	public getHP(): number {
		return this.health;
	}
	public getSP(): number {
		return this.stamina;
	}
	public getMP(): number {
		return this.mana;
	}

	public setWeapon(w: Weapon | null): void {
		this.weapon = w;
	}
	public setSpell(s: Spell | null): void {
		this.spell = s;
	}
	public setArmor(a: Armor | null): void {
		this.armor = a;
	}
	public setPotion(p: Potion | null): void {
		this.potion = p;
	}
	public setKeyItems(items: string[]): void {
		this.keyItems = items;
	}

	public hasWeapon(): Boolean {
		return this.weapon != null;
	}
	public hasSpell(): Boolean {
		return this.spell != null;
	}
	public hasArmor(): Boolean {
		return this.armor != null;
	}
	public hasPotion(): Boolean {
		return this.potion != null;
	}
	public hasKeyItems(): Boolean {
		return this.keyItems.length != 0;
	}

	public getScore(): number {
		return this.score;
	}
	public getMoney(): number {
		return this.money;
	}
	public addMoney(money: number): void {
		this.money += money;
		this.score += money;
	}

	public act(): void {}

	public clone(): Entity {
		let newPlayer = new Player(MAX_HP_DEFAULT, MAX_MP_DEFAULT, MAX_SP_DEFAULT, STRENGTH_DEFAULT);
		newPlayer.sprite = this.sprite;
		return newPlayer;
	}
}
