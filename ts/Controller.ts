import { Game } from './Game';
import { Direction, CalcDir } from './Positioning';

import _controls from '../public/controls.json';

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

export class Controller {
	private controls: { [key: string]: number };
	private action: ACTION | null = null;
	private dir: Direction | null = null;
	private pressed: Set<number>;
	private currentlyPressed: Set<number>;
	private actionGiven: Boolean;
	private isKeyPressed(action: ACTION): Boolean {
		return this.pressed.has(this.controls[<string>action]);
	}
	private processInput(): void {
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
				// console
				this.actionGiven = false;
			}
		}
	}
	private processConsole(): void {}

	constructor() {
		this.controls = _controls;
		this.pressed = new Set();
		this.currentlyPressed = new Set();
		this.actionGiven = false;

		document.addEventListener('keydown', (e) => this.readInput(e));
		document.addEventListener('keyup', (e) => this.readInput(e, false));
		document.onwheel = (e) => this.readInput(e);
	}
	public readInput(e: Event, keyDown = true) {
		if (e instanceof KeyboardEvent) {
			let code = e.which;
			if (keyDown) {
				if (e.ctrlKey || e.altKey) return;
				this.pressed.add(code);
				this.currentlyPressed.add(code);
			} else {
				this.currentlyPressed.delete(code);
				if (!this.currentlyPressed.size) this.processInput();
			}
		} else if (e instanceof WheelEvent) {
			Game.getInstance().changeScale(e.deltaY / 50);
		}
	}
	public getAction(): ACTION | null {
		return this.action;
	}
	public getDirection(): Direction | null {
		return this.dir;
	}
	public clearActions(): void {
		this.actionGiven = false;
		this.pressed.clear();
	}
	public hasAction(): Boolean {
		return this.actionGiven;
	}
}
