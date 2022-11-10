import { Leaderboard } from './Leaderboard';
import { Game } from './Game';

export class Menu {
	private mainOpened = false;
	private saveOpened = false;
	private controlsOpened = false;
	private leaderboardOpened = false;
	private audioOpened = false;
	private chosenSave: 0 | 1 | 2 | 3;
	private menu: HTMLDivElement;
	private menuOverlay: HTMLDivElement;
	private mainMenuButtons: HTMLButtonElement[];
	private saveMenuButtons: HTMLButtonElement[];
	private controlsList: HTMLDivElement;
	private audioSettings: HTMLDivElement;
	private leaderboard: HTMLDivElement;
	private focusedIndex: number;
	private title: HTMLHeadingElement;
	private saveBtnIndex: number;
	private game: Game;

	constructor() {
		this.menu = <HTMLDivElement>document.getElementById('game-menu')!;
		this.menuOverlay = <HTMLDivElement>document.getElementById('menu-overlay')!;
		this.chosenSave = 1;
		this.focusedIndex = 0;
		this.saveBtnIndex = 4;
		this.mainMenuButtons = this.initMainMenuButtons();
		this.saveMenuButtons = this.initSaveMenuButtons();
		this.title = <HTMLHeadingElement>document.getElementById('game-menu-title')!;
		this.controlsList = <HTMLDivElement>document.getElementById('controls-list')!;
		this.audioSettings = <HTMLDivElement>document.getElementById('audioOptions')!;
		this.leaderboard = <HTMLDivElement>document.getElementById('leaderboard')!;
		this.setEndButtonListener();
		this.game = Game.getInstance();
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
			this.game.setStarted();
			this.game.getAudioManager().playAudio('select');
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
			this.game.getAudioManager().playAudio('select');
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
			this.game.getAudioManager().playAudio('select');
		});
		buttons.push(btn);

		// Audio
		btn = document.createElement('button');
		btn.id = 'btn-audio';
		btn.innerHTML = 'Audio';
		btn.addEventListener('click', (e) => {
			this.audioOpened = true;
			this.focusedIndex = 0;
			this.setButtons();
			this.game.getAudioManager().playAudio('select');
		});
		buttons.push(btn);

		// Leaderboard
		btn = document.createElement('button');
		btn.id = 'btn-leaderboard';
		btn.innerHTML = 'Leaderboard';
		btn.addEventListener('click', (e) => {
			this.leaderboardOpened = true;
			this.focusedIndex = 0;
			this.setButtons();
			this.game.getAudioManager().playAudio('select');
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
				this.game.getAudioManager().playAudio('select');
			});
			buttons.push(btn);
		}

		// Save
		btn = document.createElement('button');
		btn.id = 'btn-save';
		btn.innerHTML = 'Save';
		btn.addEventListener('click', (e) => {
			if (this.game.getSaveManager().save(this.chosenSave)) {
				this.toggle();
				this.game.getAudioManager().playAudio('select');
			}
		});
		buttons.push(btn);

		// Load
		btn = document.createElement('button');
		btn.id = 'btn-load';
		btn.innerHTML = 'Load';
		btn.addEventListener('click', (e) => {
			if (this.game.getSaveManager().load(this.chosenSave)) {
				this.game.setStarted();
				this.game.getAudioManager().playAudio('select');
				this.toggle();
			}
		});
		buttons.push(btn);

		// Back
		btn = document.createElement('button');
		btn.id = 'btn-back';
		btn.innerHTML = 'Back';
		btn.addEventListener('click', (e) => {
			if (this.leaderboardOpened && !this.game.isActive()) location.reload();

			this.setVisibility(false, false, false, false);
			this.focusedIndex = 0;
			this.setButtons();
			this.game.getAudioManager().playAudio('select');
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

	private setButtons(): void {
		if (this.saveOpened) {
			this.title.innerHTML = 'Save/Load';
			this.setHidden(true, true, true);
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => {
				btn.classList.remove('focused');
				if (!(btn.id == 'btn-save' && !this.game.hasStarted())) btn.hidden = false;
				if (btn.id == `btn-save-${this.chosenSave}`) btn.classList.add('selected');
				else btn.classList.remove('selected');
			});
			this.saveMenuButtons[this.focusedIndex].classList.add('focused');
		} else if (this.controlsOpened) {
			this.title.innerHTML = 'Controls';
			this.setHidden(false, true, true);
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.at(-1)!.hidden = false;
			this.saveMenuButtons.at(-1)!.classList.add('focused');
		} else if (this.audioOpened) {
			this.title.innerHTML = 'Audio';
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.setHidden(true, false, true);
			this.saveMenuButtons.at(-1)!.hidden = false;
			this.saveMenuButtons.at(-1)!.classList.add('focused');
			this.game.getAudioManager().loadAudioSettings();
		} else if (this.leaderboardOpened) {
			this.title.innerHTML = 'Leaderboard';
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.setHidden(true, true, false);
			this.saveMenuButtons.at(-1)!.hidden = false;
			this.saveMenuButtons.at(-1)!.classList.add('focused');
			Leaderboard.load();
		} else {
			this.title.innerHTML = this.game.hasStarted() ? 'Pause' : 'Game';
			this.setHidden(true, true, true);
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.mainMenuButtons.forEach((btn) => {
				btn.hidden = false;
				btn.classList.remove('focused');
				if (btn.id == 'btn-start') btn.innerHTML = this.game.hasStarted() ? 'Resume' : 'Start';
				else if (btn.id == 'btn-saves')
					btn.innerHTML = this.game.hasStarted() ? 'Save & Load' : 'Load';
			});
			this.mainMenuButtons[this.focusedIndex].classList.add('focused');
		}
	}

	public processEscape(): void {
		if (this.saveOpened || this.controlsOpened || this.audioOpened || this.leaderboardOpened) {
			this.game.getAudioManager().playAudio('select');
			this.setVisibility(false, false, false, false);
			this.focusedIndex = 0;
			this.setButtons();
		} else if (this.game.hasStarted()) {
			this.game.getAudioManager().playAudio('select');
			this.toggle();
		}
	}

	private setHidden(controls = true, audio = true, leaderboard = true) {
		this.controlsList.hidden = controls;
		this.audioSettings.hidden = audio;
		this.leaderboard.hidden = leaderboard;
	}

	private setVisibility(
		controls = this.controlsOpened,
		audio = this.audioOpened,
		leaderboard = this.leaderboardOpened,
		save = this.saveOpened
	) {
		this.saveOpened = save;
		this.controlsOpened = controls;
		this.audioOpened = audio;
		this.leaderboardOpened = leaderboard;
	}

	public toggle(stopAudio = true) {
		this.mainOpened = !this.mainOpened;
		if (this.mainOpened) {
			this.menuOverlay.classList.remove('hidden');
			this.menu.classList.remove('hidden');
			this.setButtons();
			if (stopAudio) {
				this.game.getAudioManager().pauseBackground();
				this.game.getAudioManager().stopAllSFX();
			}
		} else {
			this.menuOverlay.classList.add('hidden');
			this.menu.classList.add('hidden');
			this.mainMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveMenuButtons.forEach((btn) => (btn.hidden = true));
			this.saveOpened = false;
			this.focusedIndex = 0;
			this.game.getAudioManager().playBackground();
		}
	}

	public opened(): Boolean {
		return this.mainOpened;
	}

	public getFocusedButton(): HTMLButtonElement {
		if (this.controlsOpened || this.leaderboardOpened || this.audioOpened)
			return this.saveMenuButtons.at(-1)!;
		else if (this.saveOpened) return this.saveMenuButtons[this.focusedIndex];
		else return this.mainMenuButtons[this.focusedIndex];
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
		if (!this.game.hasStarted() && this.saveOpened && this.focusedIndex == this.saveBtnIndex)
			this.nextButton();
		this.setButtons();
	}

	public prevButton(): void {
		if (this.controlsOpened) return;
		if (--this.focusedIndex < 0)
			this.focusedIndex += !this.saveOpened
				? this.mainMenuButtons.length
				: this.saveMenuButtons.length;
		if (!this.game.hasStarted() && this.saveOpened && this.focusedIndex == this.saveBtnIndex)
			this.prevButton();
		this.setButtons();
	}

	public endScreen(dead = true): void {
		this.menuOverlay.classList.remove('hidden');

		const endTitle = <HTMLHeadingElement>document.getElementById('game-result')!;
		const endForm = <HTMLFormElement>document.getElementById('form')!;
		const nameInp = <HTMLInputElement>document.getElementById('username');

		endTitle.hidden = false;
		endForm.hidden = false;

		nameInp.value = localStorage.getItem('username') || 'Player';
		endTitle.innerHTML = dead ? 'GAME OVER' : 'YOU WON!';

		this.game.getAudioManager().stopBackground();
		this.game.getAudioManager().playAudio(dead ? 'loss' : 'win');
	}

	private setEndButtonListener() {
		const endTitle = <HTMLHeadingElement>document.getElementById('game-result')!;
		const endForm = <HTMLFormElement>document.getElementById('form')!;
		const nameInp = <HTMLInputElement>document.getElementById('username');
		const btn = <HTMLButtonElement>document.getElementById('btn-end')!;
		btn.addEventListener('click', (e) => {
			e.preventDefault();

			const name = nameInp.value;
			localStorage.setItem('username', name || 'Player');
			Leaderboard.update({ name, score: this.game.getPlayer().getScore() });

			this.leaderboardOpened = true;
			this.toggle(false);

			endTitle.hidden = true;
			endForm.hidden = true;
		});
	}
}
