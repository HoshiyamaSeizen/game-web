import { Game } from './Game';
import { Field } from './Map/Field';
import { Sprite } from './Storage';
import { Item } from './Objects/Item';
import { Position } from './Positioning';
import { Entity } from './Objects/Entity';

const spriteSize = 16;

export class Drawer {
	private animState = {
		secondAnimFrame: false,
		playerResting: false,
		playerDropping: false,
		playerDrinking: false,
		scale: 3,
	};
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private drawItem(item: Item, xAbs: number, yAbs: number): void {
		this.drawSprite(item.getSprite(), xAbs, yAbs);
	}
	private drawEntity(entity: Entity, xAbs: number, yAbs: number): void {
		let sprite = entity.getSprite();
		sprite.pos = new Position(+entity.getDir() % 4, +this.animState.secondAnimFrame);
		this.drawSprite(sprite, xAbs, yAbs);
	}
	private drawPlayer(xAbs: number, yAbs: number): void {
		let p = Game.getInstance().getPlayer();
		let sprite = p.getSprite();

		if (this.animState.playerResting) sprite.pos = new Position(0, 2);
		else if (this.animState.playerDropping) sprite.pos = new Position(1, 2);
		else if (this.animState.playerDrinking) sprite.pos = new Position(2, 2);
		else sprite.pos = new Position(+p.getDir() % 4, +this.animState.secondAnimFrame);
		this.drawSprite(sprite, xAbs, yAbs);

		if (p.hasArmor()) {
			p.getArmor()!.getUSprite().pos = sprite.pos;
			this.drawSprite(p.getArmor()?.getUSprite()!, xAbs, yAbs);
		}
		if (
			!this.animState.playerResting &&
			!this.animState.playerDropping &&
			!this.animState.playerDrinking
		) {
			if (p.hasWeapon()) {
				p.getWeapon()!.getUSprite().pos = sprite.pos;
				this.drawSprite(p.getWeapon()?.getUSprite()!, xAbs, yAbs);
			}
			if (p.hasSpell()) {
				p.getSpell()!.getUSprite().pos = sprite.pos;
				this.drawSprite(p.getSpell()?.getUSprite()!, xAbs, yAbs);
			}
		}
	}
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
	}

	private noSmoothing(): void {
		// @ts-ignore
		this.ctx.webkitImageSmoothingEnabled = false;
		// @ts-ignore
		this.ctx.mozImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;
	}

	public drawField(f: Field): void {
		this.noSmoothing();
		let x, y: number;
		let scaledSpriteSize = spriteSize * this.animState.scale;

		let pos = Game.getInstance().getPlayer().getPos();
		let offsetX = Math.round(this.canvas.width / 2 - scaledSpriteSize * (0.5 + pos.x));
		let offsetY = Math.round(this.canvas.height / 2 - scaledSpriteSize * (0.5 + pos.y));

		for (let i = 0; i < f.getWidth(); i++) {
			for (let j = 0; j < f.getHeigth(); j++) {
				x = i * scaledSpriteSize + offsetX;
				y = j * scaledSpriteSize + offsetY;
				let pos = new Position(i, j);
				this.drawSprite(f.cellAt(pos).getSprite(), x, y);
				if (f.cellAt(pos).hasItem()) this.drawItem(f.cellAt(pos).getItem()!, x, y);
				if (f.cellAt(pos).isEntityEnemy()) this.drawEntity(f.cellAt(pos).getEntity()!, x, y);
				else if (f.cellAt(pos).isEntityPlayer()) this.drawPlayer(x, y);
			}
		}
	}
	public drawInfo(): void {
		this.ctx.font = '22px Pixeboy';
		this.ctx.fillStyle = 'white';

		let p = Game.getInstance().getPlayer();
		let text: string;

		text = `HP: ${p.getHP()}\tSP: ${p.getSP()}\tMP: ${p.getMP()}`;
		this.ctx.fillText(text, 10, 25);
		text = `Weapon: ${p.hasWeapon() ? p.getWeapon()?.getName().replace('_', ' ') : 'None'}`;
		this.ctx.fillText(text, 10, 50);
		text = `Spell: ${p.hasSpell() ? p.getSpell()?.getName().replace('_', ' ') : 'None'}`;
		this.ctx.fillText(text, 10, 75);
		text = `Armor: ${p.hasArmor() ? p.getArmor()?.getName().replace('_', ' ') : 'None'}`;
		this.ctx.fillText(text, 10, 100);
		text = `Potion: ${p.hasPotion() ? p.getPotion()?.getName().replace('_', ' ') : 'None'}`;
		this.ctx.fillText(text, 10, 125);
		text = `Money: ${p.getMoney()}`;
		this.ctx.fillText(text, 10, 150);

		text = `Goals: ${'None'}`;
	}
	public drawLog(): void {
		this.ctx.font = '16px PixeloidSans';
		this.ctx.fillStyle = 'white';

		let y = 25;
		let text: string;
		Game.getInstance()
			.getEvents()
			.forEach((e) => {
				text = e.toString();
				this.ctx.fillText(text, this.canvas.width - this.ctx.measureText(text).width - 10, y);
				y += 20;
			});
	}
	public clear(): void {
		this.ctx.fillStyle = 'black';
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
		if (newScale < 1) this.animState.scale = 1;
		else if (newScale > 5) this.animState.scale = 5;
		else this.animState.scale = newScale;
	}
	public setPlayerSprite(): void {
		let image = new Image();
		image.src = '../public/assets/objects/Player.png';
		Game.getInstance()
			.getPlayer()
			.setSprite({ source: image, pos: new Position(0, 0) });
	}
	public addResizeListener(): void {
		const resize = () => {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener('resize', resize, false);
	}
}
