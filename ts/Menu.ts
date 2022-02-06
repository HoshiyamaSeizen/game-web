import { Game } from './Game';

export class Menu {
	private mainOpened: Boolean;
	private saveOpened: Boolean;
	private controlsOpened: Boolean;
	private chosenSave: 0 | 1 | 2 | 3;
	private menu: HTMLDivElement;
	private menuOverlay: HTMLDivElement;
	private mainMenuButtons: HTMLButtonElement[];
	private saveMenuButtons: HTMLButtonElement[];
	private controlsList: HTMLDivElement;
	private focusedIndex: number;
	private title: HTMLHeadingElement;
	private endTitle: HTMLHeadElement;
	private saveBtnIndex: number;

	constructor() {
		this.menu = <HTMLDivElement>document.getElementById('game-menu')!;
		this.menuOverlay = <HTMLDivElement>document.getElementById('menu-overlay')!;
		this.mainOpened = false;
		this.saveOpened = false;
		this.controlsOpened = false;
		this.chosenSave = 1;
		this.focusedIndex = 0;
		this.saveBtnIndex = 4;
		this.mainMenuButtons = this.initMainMenuButtons();
		this.saveMenuButtons = this.initSaveMenuButtons();
		this.title = <HTMLHeadingElement>document.getElementById('game-menu-title')!;
		this.controlsList = <HTMLDivElement>document.getElementById('controls-list')!;
		this.endTitle = <HTMLHeadingElement>document.getElementById('game-result')!;
		this.initControlsList();

		this.toggle();
	}

	private initMainMenuButtons(): HTMLButtonElement[] {
		let buttons: HTMLButtonElement[] = [];
		let btn: HTMLButtonElement;

		// Start|Resume
		btn = document.createElement('button');
		btn.id = 'btn-start';
		btn.innerHTML = 'Start';
		btn.addEventListener('click', (e) => {
			Game.getInstance().setStarted();
			this.toggle();
		});
		buttons.push(btn);

		// Save & Load
		btn = document.createElement('button');
		btn.id = 'btn-saves';
		btn.innerHTML = 'Load';
		btn.addEventListener('click', (e) => {
			this.saveOpened = true;
			this.focusedIndex = 1;
			this.setButtons();
		});
		buttons.push(btn);

		// Controls
		btn = document.createElement('button');
		btn.id = 'btn-controls';
		btn.innerHTML = 'Controls';
		btn.addEventListener('click', (e) => {
			this.controlsOpened = true;
			this.focusedIndex = 0;
			this.setButtons();
		});
		buttons.push(btn);

		buttons.forEach((btn, index) => {
			btn.addEventListener('mouseover', (e) => {
				this.setFocused(index);
				this.setButtons();
			});
			this.menu.appendChild(btn);
			btn.hidden = true;
		});
		return buttons;
	}
	private initSaveMenuButtons(): HTMLButtonElement[] {
		let buttons: HTMLButtonElement[] = [];
		let btn: HTMLButtonElement;

		// QuickSave
		// Saves
		for (let i: 0 | 1 | 2 | 3 = 0; i < 4; i++) {
			btn = document.createElement('button');
			btn.id = `btn-save-${i}`;
			btn.innerHTML = `${!i ? 'Quick' : ''}Save ${i ? i : ''}`;
			btn.addEventListener('click', (e) => {
				this.chosenSave = i;
				this.setButtons();
			});
			buttons.push(btn);
		}

		// Save
		btn = document.createElement('button');
		btn.id = 'btn-save';
		btn.innerHTML = 'Save';
		btn.addEventListener('click', (e) => {
			if (Game.getInstance().getSaveManager().save(this.chosenSave)) {
				this.toggle();
			}
		});
		buttons.push(btn);

		// Load
		btn = document.createElement('button');
		btn.id = 'btn-load';
		btn.innerHTML = 'Load';
		btn.addEventListener('click', (e) => {
			if (Game.getInstance().getSaveManager().load(this.chosenSave)) {
				Game.getInstance().setStarted();
				this.toggle();
			}
		});
		buttons.push(btn);

		// Back
		btn = document.createElement('button');
		btn.id = 'btn-back';
		btn.innerHTML = 'Back';
		btn.addEventListener('click', (e) => {
			this.saveOpened = false;
			this.controlsOpened = false;
			this.focusedIndex = 0;
			this.setButtons();
		});
		buttons.push(btn);

		buttons.forEach((btn, index) => {
			btn.addEventListener('mouseover', (e) => {
				this.setFocused(index);
				this.setButtons();
			});
			this.menu.appendChild(btn);
			btn.hidden = true;
		});
		return buttons;
	}

	private initControlsList(): void {
		Game.getInstance()
			.getController()
			.getControlsString()
			.forEach((s) => {
				let p = document.createElement('p');
				p.innerHTML = s;
				this.controlsList.appendChild(p);
			});
	}

	private setButtons(): void {
		if (this.saveOpened) {
			this.title.innerHTML = 'Save/Load';
			this.controlsList.hidden = true;
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => {
				btn.classList.remove('focused');
				if (!(btn.id == 'btn-save' && !Game.getInstance().hasStarted())) btn.hidden = false;
				if (btn.id == `btn-save-${this.chosenSave}`) btn.classList.add('selected');
				else btn.classList.remove('selected');
			});
			this.saveMenuButtons[this.focusedIndex].classList.add('focused');
		} else if (this.controlsOpened) {
			this.title.innerHTML = 'Controls';
			this.controlsList.hidden = false;
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.at(-1)!.hidden = false;
			this.saveMenuButtons.at(-1)!.classList.add('focused');
		} else {
			this.title.innerHTML = Game.getInstance().hasStarted() ? 'Pause' : 'Game';
			this.controlsList.hidden = true;
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.mainMenuButtons.forEach((btn) => {
				btn.hidden = false;
				btn.classList.remove('focused');
				if (btn.id == 'btn-start')
					btn.innerHTML = Game.getInstance().hasStarted() ? 'Resume' : 'Start';
				else if (btn.id == 'btn-saves')
					btn.innerHTML = Game.getInstance().hasStarted() ? 'Save & Load' : 'Load';
			});
			this.mainMenuButtons[this.focusedIndex].classList.add('focused');
		}
	}

	public processEscape(): void {
		if (this.saveOpened || this.controlsOpened) {
			this.saveOpened = false;
			this.controlsOpened = false;
			this.focusedIndex = 0;
			this.setButtons();
		} else if (Game.getInstance().hasStarted()) {
			this.toggle();
		}
	}

	public toggle() {
		this.mainOpened = !this.mainOpened;
		if (this.mainOpened) {
			this.menuOverlay.classList.remove('hidden');
			this.menu.classList.remove('hidden');
			this.setButtons();
		} else {
			this.menuOverlay.classList.add('hidden');
			this.menu.classList.add('hidden');
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveOpened = false;
			this.focusedIndex = 0;
		}
	}

	public opened(): Boolean {
		return this.mainOpened;
	}

	public getFocusedButton(): HTMLButtonElement {
		if (this.controlsOpened) return this.saveMenuButtons.at(-1)!;
		else if (!this.saveOpened) return this.mainMenuButtons[this.focusedIndex];
		else return this.saveMenuButtons[this.focusedIndex];
	}

	public setFocused(index: number): void {
		this.focusedIndex = index;
	}

	public nextButton(): void {
		if (this.controlsOpened) return;
		if (
			++this.focusedIndex >=
			(!this.saveOpened ? this.mainMenuButtons.length : this.saveMenuButtons.length)
		)
			this.focusedIndex = 0;
		if (
			!Game.getInstance().hasStarted() &&
			this.saveOpened &&
			this.focusedIndex == this.saveBtnIndex
		)
			this.nextButton();
		this.setButtons();
	}

	public prevButton(): void {
		if (this.controlsOpened) return;
		if (--this.focusedIndex < 0)
			this.focusedIndex += !this.saveOpened
				? this.mainMenuButtons.length
				: this.saveMenuButtons.length;
		if (
			!Game.getInstance().hasStarted() &&
			this.saveOpened &&
			this.focusedIndex == this.saveBtnIndex
		)
			this.prevButton();
		this.setButtons();
	}

	public endScreen(dead = true): void {
		this.menuOverlay.classList.remove('hidden');
		this.endTitle.hidden = false;
		this.endTitle.innerHTML = dead ? 'GAME OVER' : 'YOU WON!';
	}
}
