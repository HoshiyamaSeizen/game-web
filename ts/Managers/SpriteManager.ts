import { Player } from '../Objects/Player';
import { Position } from '../Positioning';

import sprites from '../../public/assets/sprites.json';

export const spriteSize = 32;
export type Sprite = {
	pos: Position;
	offset: Position;
};

export class SpriteManager {
	private image = new Image();
	private spriteMap = new Map<string, Sprite>();

	public readSprites(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.image.onload = () => resolve();
			this.image.src = 'assets/spritesheet.png';

			sprites.forEach((obj) => {
				this.spriteMap.set(obj.name, {
					pos: new Position(obj.x / spriteSize, obj.y / spriteSize),
					offset: new Position(0, 0),
				});
			});
		});
	}

	public getSprite(name: string): Sprite {
		return this.spriteMap.get(name)!;
	}

	public setPlayerSprite(player: Player): void {
		player.setSprite(this.spriteMap.get('Player')!);
	}

	public getSpriteSheet(): HTMLImageElement {
		return this.image;
	}
}
