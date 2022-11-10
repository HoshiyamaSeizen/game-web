import { Game } from '../Game';
import { Direction, CalcDir } from '../Positioning';

import _controls from '../../public/data/controls.json';

export enum ACTION {
	UP = 'UP',
	DOWN = 'DOWN',
	LEFT = 'LEFT',
	RIGHT = 'RIGHT',
	HIT = 'HIT',
	CAST = 'CAST',
	SLEEP = 'SLEEP',
	BUFF = 'BUFF',
	PICK_UP = 'PICK_UP',
	DROP_W = 'DROP_W',
	DROP_S = 'DROP_S',
	DROP_A = 'DROP_A',
	DROP_P = 'DROP_P',
	QSAVE = 'QSAVE',
	QLOAD = 'QLOAD',
	MOVE = 'MOVE',
	END = 'END',
}

export class EventManager {
	private controls: { [key: string]: string } = _controls;
	private action: ACTION | null = null;
	private dir: Direction | null = null;
	private pressed: Set<string> = new Set();
	private currentlyPressed: Set<string> = new Set();
	private actionGiven = false;

	constructor() {
		document.addEventListener('keydown', (e) => this.readInput(e));
		document.addEventListener('keyup', (e) => this.readInput(e, false));

		const canvas = <HTMLCanvasElement>document.getElementById('canvas')!;
		canvas.onwheel = (e) => this.readInput(e);

		this.initControlsList();
	}

	public readInput(e: Event, keyDown = true) {
		if (!Game.getInstance().isActive()) return;
		if (e instanceof KeyboardEvent) {
			let code = e.code;
			if (keyDown) {
				if (e.ctrlKey || e.altKey) return;
				this.pressed.add(code);
				this.currentlyPressed.add(code);
			} else {
				this.currentlyPressed.delete(code);
				if (!this.currentlyPressed.size) this.processInput();
			}
		} else if (e instanceof WheelEvent) {
			e.preventDefault();
			e.stopPropagation();
			Game.getInstance().changeScale(-e.deltaY / 50);
		}
	}

	private isKeyPressed(action: ACTION): Boolean {
		return this.pressed.has(this.controls[<string>action]);
	}
	private processInput(): void {
		let menu = Game.getInstance().getMenu();
		let dialogue = Game.getInstance().getDialogue();

		if (menu.opened()) {
			if (this.pressed.has('Escape')) menu.processEscape();
			else if (this.pressed.has('Enter')) this.click(menu.getFocusedButton());
			else if (this.pressed.has('ArrowUp') || this.pressed.has('ArrowLeft')) menu.prevButton();
			else if (this.pressed.has('ArrowDown') || this.pressed.has('ArrowRight'))
				menu.nextButton();
		} else if (dialogue.opened()) {
			if (this.pressed.has('Escape') || !dialogue.shouldProceed()) dialogue.close();
			else dialogue.next();
		} else {
			this.actionGiven = true;

			let Ndir = this.isKeyPressed(ACTION.UP);
			let Edir = this.isKeyPressed(ACTION.RIGHT);
			let Sdir = this.isKeyPressed(ACTION.DOWN);
			let Wdir = this.isKeyPressed(ACTION.LEFT);
			this.dir = CalcDir(Ndir, Edir, Sdir, Wdir);

			if (this.dir !== null) {
				if (this.isKeyPressed(ACTION.HIT)) this.action = ACTION.HIT;
				else if (this.isKeyPressed(ACTION.CAST)) this.action = ACTION.CAST;
				else this.action = ACTION.MOVE;
			} else {
				if (this.isKeyPressed(ACTION.SLEEP)) this.action = ACTION.SLEEP;
				else if (this.isKeyPressed(ACTION.PICK_UP)) this.action = ACTION.PICK_UP;
				else if (this.isKeyPressed(ACTION.BUFF)) this.action = ACTION.BUFF;
				else if (this.isKeyPressed(ACTION.DROP_W)) this.action = ACTION.DROP_W;
				else if (this.isKeyPressed(ACTION.DROP_S)) this.action = ACTION.DROP_S;
				else if (this.isKeyPressed(ACTION.DROP_A)) this.action = ACTION.DROP_A;
				else if (this.isKeyPressed(ACTION.DROP_P)) this.action = ACTION.DROP_P;
				else if (this.isKeyPressed(ACTION.QSAVE)) this.action = ACTION.QSAVE;
				else if (this.isKeyPressed(ACTION.QLOAD)) this.action = ACTION.QLOAD;
				else {
					// Menu
					if (this.pressed.has('Escape')) menu.toggle();
					this.actionGiven = false;
				}
			}
		}
		this.pressed.clear();
	}

	public getAction(): ACTION | null {
		return this.action;
	}
	public getDirection(): Direction | null {
		return this.dir;
	}
	public clearActions(): void {
		this.actionGiven = false;
	}
	public hasAction(): Boolean {
		return this.actionGiven;
	}

	private getActionControls(action: ACTION): string {
		return this.controls[<string>action];
	}

	public initControlsList(): void {
		let arr: string[] = [];
		arr.push(
			`Move: ${this.getActionControls(ACTION.UP)}, ${this.getActionControls(
				ACTION.LEFT
			)}, ${this.getActionControls(ACTION.DOWN)}, ${this.getActionControls(ACTION.RIGHT)}`
		);
		arr.push(`Hit/Talk: ${this.getActionControls(ACTION.HIT)} + move`);
		arr.push(`Cast spell: ${this.getActionControls(ACTION.CAST)} + move`);
		arr.push(`Sleep: ${this.getActionControls(ACTION.SLEEP)}`);
		arr.push(`Drink potion: ${this.getActionControls(ACTION.BUFF)}`);
		arr.push(`Pick up: ${this.getActionControls(ACTION.PICK_UP)}`);
		arr.push(`Drop weapon: ${this.getActionControls(ACTION.DROP_W)}`);
		arr.push(`Drop spell: ${this.getActionControls(ACTION.DROP_S)}`);
		arr.push(`Drop armor: ${this.getActionControls(ACTION.DROP_A)}`);
		arr.push(`Drop potion: ${this.getActionControls(ACTION.DROP_P)}`);
		arr.push(`Quick save: ${this.getActionControls(ACTION.QSAVE)}`);
		arr.push(`Quick load: ${this.getActionControls(ACTION.QLOAD)}`);
		arr.forEach((s) => {
			let p = document.createElement('p');
			p.innerHTML = s;
			document.getElementById('controls-list')!.appendChild(p);
		});
	}

	private click(element: HTMLElement): void {
		let clickEvent = new MouseEvent('click', {
			view: window,
			bubbles: true,
			cancelable: false,
		});
		element.dispatchEvent(clickEvent);
	}
}
