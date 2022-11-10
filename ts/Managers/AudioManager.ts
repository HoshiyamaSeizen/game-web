import { Game } from './../Game';
import _audio from '../../public/assets/audio/audio.json';

export class AudioManager {
	private audio = new Map<string, HTMLAudioElement>();
	private volume = 1;
	private background = '';
	private bgVolume = 1;
	private rangeSFX = <HTMLInputElement>document.getElementById('range-sfx')!;
	private rangeBG = <HTMLInputElement>document.getElementById('range-bg')!;

	constructor() {
		this.rangeSFX.addEventListener('change', () => (this.volume = +this.rangeSFX.value));
		this.rangeBG.addEventListener('change', () => (this.bgVolume = +this.rangeBG.value));
	}

	public readAudio() {
		return Promise.all(
			_audio.map((sound) => {
				return new Promise<void>((resolve, reject) => {
					this.audio.set(sound, new Audio(`assets/audio/${sound}.mp3`));
					this.audio.get(sound)?.addEventListener('canplaythrough', () => resolve());
				});
			})
		);
	}
	public playAudio(name: string, relVolume = 1, loop = false) {
		const sound = this.audio.get(name);
		if (!sound) return;
		sound.volume = this.volume * relVolume;
		sound.loop = loop;
		sound.play();
	}
	public pauseAudio(name: string) {
		this.audio.get(name)?.pause();
	}
	public stopAllSFX() {
		this.audio.forEach((audio, name) => {
			if (name === this.background) return;
			audio.pause();
			audio.currentTime = 0;
		});
	}
	public playBackground() {
		const sound = this.audio.get(this.background);
		if (!sound) return;
		sound.volume = this.bgVolume;
		sound.loop = true;
		sound.play();
	}
	public setBackground(bgAudio: string) {
		if (this.background === bgAudio) return;
		if (this.background) this.stopBackground();
		this.background = bgAudio;
		if (Game.getInstance().hasStarted()) this.playBackground();
	}
	public pauseBackground() {
		this.pauseAudio(this.background);
	}
	public stopBackground() {
		this.audio.get(this.background)!.currentTime = 0;
		this.pauseBackground();
	}

	public loadAudioSettings(): void {
		this.rangeSFX.value = this.volume.toString();
		this.rangeBG.value = this.bgVolume.toString();
	}
}
