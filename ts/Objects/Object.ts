import { Drawable } from './Drawable';
import { Position, Direction } from '../Positioning';

export class GameObject extends Drawable {
	protected pos = new Position(0, 0);
	protected prevDir = Direction.S;
	public setPos(pos: Position): void {
		this.pos = pos;
	}
	public getDir(): Direction {
		return this.prevDir;
	}
	public getPos(): Position {
		return this.pos;
	}
}
