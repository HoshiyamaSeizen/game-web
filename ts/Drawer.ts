import { Field } from './Map/Field';
import { Player } from './Objects/Player';
import { Sprite } from './Storage';
import { Enemy } from './Objects/Enemy';
import { Item } from './Objects/Item';
import { Position } from './Positioning';

const spriteSize = 16;

export class Drawer {
	private animState = {
		secondAnimFrame: false,
		playerResting: false,
		playerDropping: false,
		playerDrinking: false,
		scale: 1,
	};
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private drawItem(item: Item, xAbs: number, yAbs: number): void {}
	private drawEnemy(enemy: Enemy, xAbs: number, yAbs: number): void {}
	private drawPlayer(xAbs: number, yAbs: number): void {}
	private drawSprite(sprite: Sprite, xAbs: number, yAbs: number): void {
		this.ctx.drawImage(
			sprite.source,
			sprite.pos.x * spriteSize,
			sprite.pos.y * spriteSize,
			spriteSize,
			spriteSize,
			xAbs,
			yAbs,
			spriteSize * this.animState.scale,
			spriteSize * this.animState.scale
		);
	}

	constructor() {
		this.canvas = <HTMLCanvasElement>document.getElementById('canvas')!;
		this.ctx = this.canvas.getContext('2d')!;
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.fillStyle = 'black';
	}

	public drawField(f: Field): void {
		let x, y: number;
		let scaledSpriteSize = spriteSize * this.animState.scale;
		let offsetX = 0; //this.canvas.width/2 - scaledSpriteSize*(0.5+p.getPos().x)
		let offsetY = 0; //this.canvas.height/2 - scaledSpriteSize*(0.5+p.getPos().y)

		for (let i = 0; i < f.getWidth(); i++) {
			for (let j = 0; j < f.getHeigth(); j++) {
				x = i * scaledSpriteSize + offsetX;
				y = j * scaledSpriteSize + offsetY;
				this.drawSprite(f.cellAt(new Position(i, j)).getSprite(), x, y);
				//items
				//enemies & player
			}
		}
	}
	public drawInfo(): void {}
	public clear(): void {
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	public toggleAnimFrame(): void {
		this.animState.secondAnimFrame = !this.animState.secondAnimFrame;
	}
	public clearPlayerAction(): void {
		this.animState.playerResting = false;
		this.animState.playerDropping = false;
		this.animState.playerDrinking = false;
	}
	public playerRest(): void {
		this.animState.playerResting = true;
	}
	public playerDrop(): void {
		this.animState.playerDropping = true;
	}
	public playerDrink(): void {
		this.animState.playerDrinking = true;
	}

	public getScale(): number {
		return this.animState.scale;
	}
	public changeScale(newScale: number): void {
		if (newScale <= 0) this.animState.scale = 1;
		else if (newScale > 6) this.animState.scale = 6;
		else this.animState.scale = newScale;
	}
}
