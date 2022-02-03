import { GameObject } from './Object';
import { Entity } from './Entity';
import { changePos, Direction, findDir, Position } from '../Positioning';
import { Condition } from '../Rules/GameRule';
import { Strategy } from './Strategy';
import { Game } from '../Game';

export enum TalkType {
	RANDOM,
	ORDER,
}

export class NPC extends GameObject implements Entity {
	private name: string;
	private strategy: Strategy | null;
	private phrases: string[];
	private tType: TalkType;
	private phraseCount: number;
	private phraseIndex: number;

	constructor() {
		super();
		this.phrases = [];
		this.tType = TalkType.RANDOM;
		this.phraseIndex = 0;
		this.phraseCount = 0;
		this.strategy = null;
		this.name = '';
	}
	public changeStat(stat: Condition, value: number): void {}
	public act(): void {
		this.strategy?.execute();
	}
	public move(dir: Direction): void {
		let newPos = changePos(this.pos, dir);
		this.movePos(newPos);
	}
	public movePos(pos: Position): void {
		let f = Game.getInstance().getField();
		if (f.isInField(pos) && f.cellAt(pos).isFree()) {
			f.cellAt(this.pos).setEntity(null);
			f.cellAt(pos).setEntity(this);
			this.prevDir = findDir(this.pos, pos);
			this.pos = pos;
		}
	}

	public setPhrases(phrases: string[]): void {
		this.phrases = phrases;
		this.phraseCount = phrases.length;
	}
	public getPhrases(): string[] {
		return this.phrases;
	}
	public getPhraseCount(): number {
		return this.phraseCount;
	}
	public readPhrase(): string {
		let phrase: string = '';
		if (this.tType == TalkType.ORDER) {
			phrase = this.phrases[this.phraseIndex];
			this.phraseIndex++;
			if (this.phraseIndex >= this.phrases.length) this.phraseIndex = 0;
		} else if (this.tType == TalkType.RANDOM) {
			phrase = this.phrases[Math.round(Math.random() * (this.phrases.length - 1))];
		}
		return phrase;
	}

	public setTalkType(tType: TalkType): void {
		this.tType = tType;
	}
	public setPhraseIndex(i: number): void {
		this.phraseIndex = i;
	}
	public getTalkType(): TalkType {
		return this.tType;
	}
	public getPhraseIndex(): number {
		return this.phraseIndex;
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
		return 0;
	}

	public hit(dir: Direction): void {}
	public hitEntity(e: Entity): void {}
	public getHit(damage: number): void {}
	public clone(): Entity {
		let newNPC = new NPC();
		newNPC.strategy = this.strategy!.clone(newNPC);
		newNPC.sprite = this.sprite!;
		newNPC.prevDir = this.prevDir;
		newNPC.name = this.name;
		newNPC.phrases = this.phrases;
		newNPC.phraseCount = this.phraseCount;
		newNPC.tType = this.tType;
		return newNPC;
	}
}
