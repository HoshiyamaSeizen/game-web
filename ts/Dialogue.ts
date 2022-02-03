import { NPC, TalkType } from './Objects/NPC';

export class Dialogue {
	private target: NPC | null;
	private isOpened: Boolean;
	private text: string;

	constructor() {
		this.target = null;
		this.isOpened = false;
		this.text = '';
	}

	public setTarget(npc: NPC): void {
		this.target = npc;
		this.isOpened = true;
		this.text = npc.readPhrase();
	}
	public getTarget(): NPC {
		return this.target!;
	}

	public opened(): Boolean {
		return this.isOpened;
	}
	public close(): void {
		this.isOpened = false;
		this.target = null;
		this.text = '';
	}

	public getText(): string {
		return this.text;
	}
	public next(): void {
		this.text = this.target!.readPhrase();
	}
	public shouldProceed(): Boolean {
		return this.target!.getTalkType() == TalkType.ORDER && this.target!.getPhraseIndex() != 0;
	}
}
