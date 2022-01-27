import { Direction } from '../Positioning';
import { Entity } from './Entity';
import { GameObject } from './Object';
export class Player extends GameObject implements Entity {
	move(dir: Direction): void {}
	hit(dir: Direction): void {}
	getHit(damage: number): void {}

	getName(): string {
		return '';
	}
	getHP(): number {
		return 0;
	}
	clone(): Entity {
		return new Player();
	}
}
