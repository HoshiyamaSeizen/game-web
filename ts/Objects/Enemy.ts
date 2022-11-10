import { eType, sourceType } from './../Event';
import { changePos, findDir } from './../Positioning';
import { Game } from './../Game';
import { Strategy } from './Strategy';
import { GameObject } from './Object';
import { Direction, Position } from '../Positioning';
import { Entity } from './Entity';
import { GameEvent } from '../Event';
import { Condition } from '../Rules/GameRule';

export class Enemy extends GameObject implements Entity {
	private name: string;
	private strategy?: Strategy;
	private health: number;
	private maxHealth: number;
	private armor: number;
	private damage: number;
	private reward = 0;
	private sound = '';
	constructor(maxHealth = 1, armor = 1, damage = 1, reward = 0) {
		super();
		this.health = maxHealth;
		this.maxHealth = maxHealth;
		this.armor = armor;
		this.damage = damage;
		this.reward = reward;
		this.name = '';
	}
	public act(): void {
		this.strategy?.execute();
	}

	public changeStat(stat: Condition, value: number): void {
		switch (stat) {
			case Condition.HP:
				this.health = value;
				if (this.health > this.maxHealth) this.health = this.maxHealth;
				break;
			case Condition.MHP:
				this.maxHealth = value;
				break;
			case Condition.DEF:
				this.armor = value;
				break;
			case Condition.DAM:
				this.damage = value;
				break;
			case Condition.MONEY:
				this.reward = value;
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
		let f = Game.getInstance().getMapManager().getField();
		if (f.isInField(pos) && f.cellAt(pos).isFree()) {
			f.cellAt(this.pos).setEntity(null);
			f.cellAt(pos).setEntity(this);
			this.prevDir = findDir(this.pos, pos);
			this.pos = pos;
		}
	}
	public hit(dir: Direction): void {
		let f = Game.getInstance().getMapManager().getField();
		let hitPos = changePos(this.pos, dir);
		if (f.isInField(hitPos) && !f.cellAt(hitPos).isFree() && f.cellAt(hitPos).isAccessible()) {
			this.hitEntity(f.cellAt(hitPos).getEntity()!);
		}
	}
	public hitEntity(e: Entity): void {
		Game.getInstance().pushEvent(
			new GameEvent(sourceType.ENEMY, eType.hitEvent, this.name, e.getName(), this.damage)
		);
		this.prevDir = findDir(this.pos, e.getPos());
		e.getHit(this.damage);
	}
	public getHit(damage: number): void {
		const game = Game.getInstance();
		let recieved = damage - (this.armor ? Math.floor(damage / this.armor--) : 0);
		this.health -= recieved;
		game.pushEvent(
			new GameEvent(sourceType.ENEMY, eType.getHitEvent, this.name, '', recieved, this.health)
		);

		if (this.health <= 0) {
			game.getAudioManager().playAudio('kill', 0.5);
			game.getMapManager().getField().cellAt(this.pos).setEntity(null);
			game.removeEntity(this);
			game.pushEvent(new GameEvent(sourceType.ENEMY, eType.deadEvent, this.name));
			game.getPlayer().addMoney(this.reward);
		}
	}

	public changeStrategy(strategy: Strategy): void {
		this.strategy = strategy;
	}
	public changeName(name: string): void {
		this.name = name;
	}
	public getName(): string {
		return this.name;
	}
	public getHP(): number {
		return this.health;
	}
	public getmaxHP(): number {
		return this.maxHealth;
	}
	public getReward(): number {
		return this.reward;
	}
	public setSound(name: string): void {
		this.sound = name;
	}
	public getSound(): string {
		return this.sound;
	}
	public clone(): Entity {
		let newEnemy = new Enemy(this.maxHealth, this.armor, this.damage, this.reward);
		newEnemy.strategy = this.strategy!.clone(newEnemy);
		newEnemy.sprite = this.sprite!;
		newEnemy.prevDir = this.prevDir;
		newEnemy.name = this.name;
		newEnemy.sound = this.sound;
		return newEnemy;
	}
}
