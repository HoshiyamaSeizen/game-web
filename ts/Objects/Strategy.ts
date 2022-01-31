import { Game } from './../Game';
import { Position, Direction, changePos, posNear, randDir } from './../Positioning';
import { Entity } from './Entity';

const nullPos = new Position(-1, -1);

export interface Strategy {
	execute(): void;
	clone(entity: Entity): Strategy;
}

export class GuardStrategy implements Strategy {
	private entity: Entity;
	private posFromGuarding: Position;
	constructor(e: Entity) {
		this.entity = e;
		this.posFromGuarding = nullPos;
	}
	public execute(): void {
		let pos = this.entity.getPos();
		if (this.posFromGuarding == nullPos) this.posFromGuarding = pos;

		let player = Game.getInstance().getPlayer();
		if (posNear(player.getPos(), pos)) {
			this.entity.hitEntity(player);
		} else {
			let newPos = changePos(pos, randDir());
			if (posNear(newPos, this.posFromGuarding)) this.entity.movePos(newPos);
		}
	}
	public clone(entity: Entity): Strategy {
		return new GuardStrategy(entity);
	}
}

export class WanderStrategy implements Strategy {
	private entity: Entity;
	constructor(e: Entity) {
		this.entity = e;
	}
	public execute(): void {
		let pos = this.entity.getPos();
		let player = Game.getInstance().getPlayer();
		if (posNear(player.getPos(), pos)) {
			this.entity.hitEntity(player);
			return;
		}
		let next = bfsToPosition(2, pos, player.getPos());
		if (next !== null) this.entity.movePos(next);
		else this.entity.move(randDir());
	}
	public clone(entity: Entity): Strategy {
		return new WanderStrategy(entity);
	}
}

export class HuntStrategy implements Strategy {
	private entity: Entity;
	constructor(e: Entity) {
		this.entity = e;
	}
	public execute(): void {
		let pos = this.entity.getPos();
		let player = Game.getInstance().getPlayer();
		if (posNear(player.getPos(), pos)) {
			this.entity.hitEntity(player);
			return;
		}
		let next = bfsToPosition(10, pos, player.getPos());
		if (next !== null) this.entity.movePos(next);
		else this.entity.move(randDir());
	}
	public clone(entity: Entity): Strategy {
		return new HuntStrategy(entity);
	}
}

export class PatrolStrategy implements Strategy {
	private entity: Entity;
	private dir: Direction;
	constructor(e: Entity) {
		this.entity = e;
		this.dir = Direction.N;
	}
	public execute(): void {
		let pos = this.entity.getPos();
		let player = Game.getInstance().getPlayer();
		if (posNear(player.getPos(), pos)) {
			this.entity.hitEntity(player);
			return;
		} else {
			let f = Game.getInstance().getField();
			for (let i = 0; i < 4; i++) {
				let newPos = changePos(pos, this.dir);
				if (f.isInField(newPos) && !f.cellAt(newPos).isFree()) {
					this.dir = <Direction>((this.dir + 1) % 4);
				} else break;
			}
			this.entity.move(this.dir);
		}
	}
	public clone(entity: Entity): Strategy {
		return new PatrolStrategy(entity);
	}
}

function bfsToPosition(maxDistance: number, start: Position, end: Position): Position | null {
	let queue: Position[] = [];
	let visited = new Map<Position, Position>();

	let f = Game.getInstance().getField()!;
	let current = start;
	let tmp: Position;
	let distance = 0;

	visited.set(current, nullPos);
	while ((queue.length > 0 || !distance) && !current.equals(end) && distance <= maxDistance) {
		for (let i = 0; i < 8; i++) {
			tmp = changePos(current, <Direction>i);
			if (
				f.isInField(tmp) &&
				(f.cellAt(tmp).isFree() || tmp.equals(end)) &&
				!mapFind(visited, tmp)
			) {
				visited.set(tmp, current);
				queue.push(tmp);
			}
		}
		current = queue.shift()!;

		distance = 0;
		tmp = current;
		while (true) {
			tmp = visited.get(tmp)!;
			distance++;
			if (visited.get(tmp)?.equals(nullPos)) break;
		}
	}

	if (!current.equals(end)) return null;
	while (true) {
		current = visited.get(current)!;
		if (visited.get(visited.get(current)!)?.equals(nullPos)) break;
	}
	return current;
}

const mapFind = (map: Map<Position, Position>, key: Position): Boolean => {
	return Array.from(map.keys()).some((pos) => {
		return pos.equals(key);
	});
};
