import { Enemy } from './Objects/Enemy';
import { Game } from './Game';
import { Field } from './Map/Field';
import { Sprite } from './Storage';
import { Item } from './Objects/Item';
import { Position } from './Positioning';
import { Entity } from './Objects/Entity';
import { finishRulesToString } from './Rules/RuleChecker';

const spriteSize = 32;

export class Drawer {
	private animState = {
		secondAnimFrame: false,
		playerResting: false,
		playerDropping: false,
		playerDrinking: false,
		scale: 2,
	};
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private scaledSpriteSize: number;

	private drawItem(item: Item, xAbs: number, yAbs: number): void {
		this.drawSprite(item.getSprite(), xAbs, yAbs);

		// Price
		if (item.getMoneyCost()) {
			let text = `${item.getMoneyCost()}$`;
			let offset = 2;
			this.ctx.font = `${Math.floor(this.scaledSpriteSize / 4)}px PixeloidSans`;
			this.ctx.fillStyle = 'white';
			this.ctx.fillText(
				text,
				xAbs + offset,
				yAbs + this.scaledSpriteSize - offset,
				this.scaledSpriteSize - 2 * offset
			);
		}
	}
	private drawEntity(entity: Entity, xAbs: number, yAbs: number): void {
		let sprite = entity.getSprite();
		sprite.pos = new Position(+entity.getDir() % 4, +this.animState.secondAnimFrame);
		this.drawSprite(sprite, xAbs, yAbs);

		if (entity instanceof Enemy && entity.getHP() < entity.getmaxHP()) {
			let offsetX = 2 * this.animState.scale;
			let offsetY = 3 * this.animState.scale;
			let barHeight = Math.ceil(this.scaledSpriteSize / 16);
			let barWidth = this.scaledSpriteSize - 2 * offsetX;
			let green = (barWidth * entity.getHP()) / entity.getmaxHP();
			this.ctx.fillStyle = 'green';
			this.ctx.fillRect(
				xAbs + offsetX,
				yAbs + this.scaledSpriteSize - barHeight - offsetY,
				green,
				barHeight
			);
			this.ctx.fillStyle = 'red';
			this.ctx.fillRect(
				xAbs + offsetX + green,
				yAbs + this.scaledSpriteSize - barHeight - offsetY,
				barWidth - green,
				barHeight
			);
		}
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
		this.scaledSpriteSize = this.animState.scale * spriteSize;
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

		let pos = Game.getInstance().getPlayer().getPos();
		let offsetX = Math.round(this.canvas.width / 2 - this.scaledSpriteSize * (0.5 + pos.x));
		let offsetY = Math.round(this.canvas.height / 2 - this.scaledSpriteSize * (0.5 + pos.y));

		for (let i = 0; i < f.getWidth(); i++) {
			for (let j = 0; j < f.getHeigth(); j++) {
				x = i * this.scaledSpriteSize + offsetX;
				y = j * this.scaledSpriteSize + offsetY;
				let pos = new Position(i, j);
				this.drawSprite(f.cellAt(pos).getSprite(), x, y);
				if (f.cellAt(pos).hasItem()) this.drawItem(f.cellAt(pos).getItem()!, x, y);
				if (f.cellAt(pos).isEntityEnemy() || f.cellAt(pos).isEntityNPC())
					this.drawEntity(f.cellAt(pos).getEntity()!, x, y);
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

		let k = 195,
			count = 0;
		finishRulesToString().forEach((rule) => {
			this.ctx.fillText(rule, 30, k);
			k += 20;
			count++;
		});
		text = `Goals: ${count ? '' : 'None'}`;
		this.ctx.fillText(text, 10, 175);
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
	public drawDialogue() {
		let dialogue = Game.getInstance().getDialogue();
		if (!dialogue.opened()) return;

		//	header
		let boxStart = Math.ceil(this.canvas.height - 200);
		let fontSize = 20;
		let offset = 10;
		this.ctx.fillStyle = '#261705';
		this.ctx.fillRect(0, boxStart, this.canvas.width, fontSize + offset * 2);

		// name
		let nameBoxOffsetY = 8;
		let nameBoxOffsetX = 40;
		let nameOffsetY = offset - nameBoxOffsetY;
		let nameOffsetX = 8;
		let text = dialogue.getTarget().getName();
		boxStart += nameBoxOffsetY;
		this.ctx.font = `${fontSize}px PixeloidSans`;
		this.ctx.fillStyle = '#b8a288';
		this.ctx.fillRect(
			nameBoxOffsetX,
			boxStart,
			this.ctx.measureText(text).width + nameOffsetX * 2,
			fontSize + nameOffsetY * 2
		);

		boxStart += nameOffsetY + fontSize - 3;
		this.ctx.fillStyle = '#140c02';
		this.ctx.fillText(
			text,
			nameBoxOffsetX + nameOffsetX + 2,
			boxStart,
			this.canvas.width - (nameBoxOffsetY + nameOffsetX)
		);

		// text box
		boxStart += offset + 3;
		this.ctx.fillStyle = '#b8a288';
		this.ctx.fillRect(0, boxStart, this.canvas.width, this.canvas.height - boxStart);

		// text
		offset = nameBoxOffsetX + nameOffsetX + 2;
		boxStart += 30;
		fontSize = 20;
		this.ctx.font = `${fontSize}px PixeloidSans`;
		this.ctx.fillStyle = '#140c02';
		this.getLines(dialogue.getText(), this.canvas.width - offset * 2).forEach((line) => {
			this.ctx.fillText(line, offset, boxStart, this.canvas.width - offset * 2);
			boxStart += fontSize + 4;
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
		this.scaledSpriteSize = this.animState.scale * spriteSize;
	}
	public setPlayerSprite(): void {
		let image = new Image();
		image.src = 'assets/objects/Player.png';
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

	private getLines(text: string, maxWidth: number): string[] {
		let words = text.split(' ');
		let lines: string[] = [];
		let currentLine: string = words[0];

		for (let i = 1; i < words.length; i++) {
			let word = words[i];
			let width = this.ctx.measureText(currentLine + ' ' + word).width;
			if (width < maxWidth) {
				currentLine += ' ' + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine);
		return lines;
	}
}
