import { NPC } from './../Objects/NPC';
import { Drawable } from './../Objects/Drawable';
import { Enemy } from './../Objects/Enemy';
import { Player } from './../Objects/Player';
import { Entity } from '../Objects/Entity';
import { Item } from '../Objects/Item';

export enum State {
	normal,
	start,
	finish,
}

export class Cell extends Drawable {
	private accessible: Boolean;
	private state: State;
	private entity: Entity | null;
	private item: Item | null;
	private transition: Transition | null;
	constructor(
		state = State.normal,
		accessible = true,
		entity: Entity | null = null,
		item: Item | null = null
	) {
		super();
		this.accessible = accessible;
		this.state = state;
		this.entity = entity;
		this.item = item;
		this.transition = null;
	}

	public getState(): State {
		return this.state;
	}
	public getItem(): Item | null {
		return this.item;
	}
	public getEntity(): Entity | null {
		return this.entity;
	}
	public getTransition(): Transition | null {
		return this.transition;
	}

	public hasItem(): Boolean {
		return this.item != null && this.isAccessible();
	}
	public isFree(): Boolean {
		return this.entity == null && this.isAccessible();
	}
	public isEntityPlayer(): Boolean {
		return this.entity instanceof Player;
	}
	public isEntityEnemy(): Boolean {
		return this.entity instanceof Enemy;
	}
	public isEntityNPC(): Boolean {
		return this.entity instanceof NPC;
	}
	public isStart(): Boolean {
		return this.state == State.start;
	}
	public isFinish(): Boolean {
		return this.state == State.finish;
	}
	public isAccessible(): Boolean {
		return this.accessible;
	}

	public setEntity(entity: Entity | null): void {
		this.entity = entity;
	}
	public setItem(item: Item | null): void {
		this.item = item;
	}
	public setState(state: State): void {
		this.state = state;
	}
	public toggleAccessibility(): void {
		this.accessible = !this.accessible;
	}
	public setTransition(t: Transition): void {
		this.transition = t;
	}
}

export type Transition = {
	map: string;
	x: number;
	y: number;
	followRules: Boolean;
};
