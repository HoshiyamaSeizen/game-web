export enum Direction {
	N,
	E,
	S,
	W,
	NE,
	SE,
	SW,
	NW,
}

export class Position {
	public x: number;
	public y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	public equal(other: Position): Boolean {
		return this.x == other.x && this.y == other.y;
	}
	public compare(other: Position): number {
		if (this.equal(other)) return 0;
		else return this.x < other.x || (this.x == other.x && this.y < other.y) ? -1 : 1;
	}
	public toString(): string {
		return `(${this.x}, ${this.y})`;
	}
}

export type Size = {
	width: number;
	height: number;
};

export const changePos = (pos: Position, dir: Direction): Position => {
	switch (dir) {
		case Direction.N:
			pos.y--;
			break;
		case Direction.NE:
			pos.x++;
			pos.y--;
			break;
		case Direction.E:
			pos.x++;
			break;
		case Direction.SE:
			pos.x++;
			pos.y++;
			break;
		case Direction.S:
			pos.y++;
			break;
		case Direction.SW:
			pos.x--;
			pos.y++;
			break;
		case Direction.W:
			pos.x--;
			break;
		case Direction.NW:
			pos.x--;
			pos.y--;
			break;
	}
	return pos;
};

export const CalcDir = (
	Ndir: Boolean,
	Edir: Boolean,
	Sdir: Boolean,
	Wdir: Boolean
): Direction | null => {
	if (Ndir && !Sdir) {
		if (Wdir && !Edir) return Direction.NW;
		if (Edir && !Wdir) return Direction.NE;
		else return Direction.N;
	} else if (Sdir && !Ndir) {
		if (Wdir && !Edir) return Direction.SW;
		if (Edir && !Wdir) return Direction.SE;
		else return Direction.S;
	} else if (Wdir && !Edir) return Direction.W;
	else if (Edir && !Wdir) return Direction.E;
	return null;
};

export const findDir = (prev: Position, next: Position): Direction => {
	let dx = next.x - prev.x;
	let dy = next.y - prev.y;
	if (dx > 0 && dy > 0) return Direction.SE;
	else if (dx == 0 && dy > 0) return Direction.S;
	else if (dx < 0 && dy > 0) return Direction.SW;
	else if (dx < 0 && dy == 0) return Direction.W;
	else if (dx < 0 && dy < 0) return Direction.NW;
	else if (dx == 0 && dy < 0) return Direction.N;
	else if (dx > 0 && dy < 0) return Direction.NE;
	else return Direction.E;
};

export const randDir = (): Direction => {
	return Math.floor(Math.random() * 8);
};
