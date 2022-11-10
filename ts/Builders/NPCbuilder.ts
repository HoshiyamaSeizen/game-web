import {
	GuardStrategy,
	HuntStrategy,
	PatrolStrategy,
	Strategy,
	WanderStrategy,
} from '../Objects/Strategy';
import { NPC, TalkType } from './../Objects/NPC';
import { Builder } from './Builder';

import npcs from '../../public/data/npcs.json';
import { Position } from '../Positioning';
import { Sprite, SpriteManager } from '../Managers/SpriteManager';
import { Game } from '../Game';

export class NPCBuilder implements Builder {
	private npc: NPC;
	private spriteManager: SpriteManager;
	constructor() {
		this.npc = new NPC();
		this.spriteManager = Game.getInstance().getSpriteManager();
	}
	public setStrategy(strategy: Strategy): void {
		this.npc.changeStrategy(strategy);
	}
	public setTalkType(tType: TalkType) {
		this.npc.setTalkType(tType);
	}
	public setPhrases(phrases: string[]) {
		this.npc.setPhrases(phrases);
	}
	public setName(name: string): void {
		this.npc.changeName(name);
	}
	public setSprite(sprite: Sprite): void {
		this.npc.setSprite(sprite);
	}
	public buildPresetNPC(name: string): void {
		let npcInfo = npcs.find((npc) => npc.name == name)!;
		this.setName(npcInfo.name);

		this.setPhrases(npcInfo.phrases);
		if (npcInfo.talkType == 'order') this.setTalkType(TalkType.ORDER);
		else if (npcInfo.talkType == 'random') this.setTalkType(TalkType.RANDOM);

		if (npcInfo.strategy == 'guard') this.setStrategy(new GuardStrategy(this.npc));
		else if (npcInfo.strategy == 'wander') this.setStrategy(new WanderStrategy(this.npc));
		else if (npcInfo.strategy == 'hunt') this.setStrategy(new HuntStrategy(this.npc));
		else if (npcInfo.strategy == 'patrol') this.setStrategy(new PatrolStrategy(this.npc));

		this.setSprite(this.spriteManager.getSprite(npcInfo.name));
	}

	public getPresetNPC(name: string): NPC {
		this.buildPresetNPC(name);
		return this.getNPC();
	}
	public getNPC(): NPC {
		let resultNPC = this.npc;
		this.reset();
		return resultNPC;
	}
	public reset(): void {
		this.npc = new NPC();
	}
	public getNPCList() {
		let npcList: string[] = [];
		npcs.forEach((npc) => {
			npcList.push(npc.name);
		});
		return npcList;
	}
}
