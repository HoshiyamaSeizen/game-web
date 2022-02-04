import { Sprite } from './../Storage';

export class Drawable {
	protected sprite?: Sprite;
	protected spriteWhenUsed?: Sprite;

	public getSprite(): Sprite {
		return this.sprite!;
	}
	public getUSprite(): Sprite {
		return this.spriteWhenUsed!;
	}
	public setSprite(sprite: Sprite): void {
		this.sprite = sprite;
	}
	public setUSprite(sprite: Sprite): void {
		this.spriteWhenUsed = sprite;
	}
}
