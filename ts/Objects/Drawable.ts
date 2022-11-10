import { Position } from './../Positioning';
import { Sprite } from '../Managers/SpriteManager';

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

export class MapDrawable {
	protected tilePos?: Position;

	public getTilePos(): Position {
		return this.tilePos!;
	}
	public setTilePos(tilePos: Position): void {
		this.tilePos = tilePos;
	}
}
