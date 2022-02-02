import { Game } from './Game';

export class Menu {
	private mainOpened: Boolean;
	private saveOpened: Boolean;
	private chosenSave: 0 | 1 | 2 | 3;
	private menu: HTMLDivElement;
	private mainMenuButtons: HTMLButtonElement[];
	private saveMenuButtons: HTMLButtonElement[];
	private title: HTMLHeadingElement;

	constructor() {
		this.menu = <HTMLDivElement>document.getElementById('game-menu')!;
		this.mainOpened = false;
		this.saveOpened = false;
		this.chosenSave = 0;
		this.mainMenuButtons = this.initMainMenuButtons();
		this.saveMenuButtons = this.initSaveMenuButtons();
		this.title = <HTMLHeadingElement>document.getElementById('game-menu-title')!;

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
			this.setButtons();
		});
		buttons.push(btn);

		buttons.forEach((btn) => {
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
			this.setButtons();
		});
		buttons.push(btn);

		buttons.forEach((btn) => {
			this.menu.appendChild(btn);
			btn.hidden = true;
		});
		return buttons;
	}
	private setButtons(): void {
		if (!this.saveOpened) {
			this.title.innerHTML = Game.getInstance().hasStarted() ? 'Pause' : 'Game';
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.mainMenuButtons.forEach((btn) => {
				btn.hidden = false;
				if (btn.id == 'btn-start')
					btn.innerHTML = Game.getInstance().hasStarted() ? 'Resume' : 'Start';
				else if (btn.id == 'btn-saves')
					btn.innerHTML = Game.getInstance().hasStarted() ? 'Save & Load' : 'Load';
			});
		} else {
			this.title.innerHTML = 'Save/Load';
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => {
				if (!(btn.id == 'btn-save' && !Game.getInstance().hasStarted())) btn.hidden = false;
				if (btn.id == `btn-save-${this.chosenSave}`) btn.classList.add('selected');
				else btn.classList.remove('selected');
			});
		}
	}

	public toggle() {
		this.mainOpened = !this.mainOpened;
		if (this.mainOpened) {
			this.menu.hidden = false;
			this.setButtons();
		} else {
			this.menu.hidden = true;
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveOpened = false;
		}
	}

	public opened(): Boolean {
		return this.mainOpened;
	}
}
