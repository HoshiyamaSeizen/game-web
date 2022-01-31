import { Direction, Position } from './../Positioning';
import { GameObject } from './Object';

export interface Entity extends GameObject {
	act(): void;
	move(dir: Direction): void;
	movePos(pos: Position): void;
	hit(dir: Direction): void;
	hitEntity(e: Entity): void;
	getHit(damage: number): void;

	getName(): string;
	getHP(): number;
	clone(): Entity;
}
