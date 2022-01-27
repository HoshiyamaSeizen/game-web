import { Direction } from './../Positioning';
import { GameObject } from './Object';

export interface Entity extends GameObject {
	move(dir: Direction): void;
	hit(dir: Direction): void;
	getHit(damage: number): void;

	getName(): string;
	getHP(): number;
	clone(): Entity;
}
