import { Item } from './../Objects/Item';
import { Entity } from './../Objects/Entity';
import { Position } from './../Positioning';
import { Cell } from './Cell';

export class Field {
	private cells: Cell[][];
	private width: number;
	private height: number;

	constructor(width = 0, height = 0) {
		this.width = width;
		this.height = height;
		this.cells = Array.from(Array(width), () => new Array(height));
		for (let i = 0; i < width; i++) {
			for (let j = 0; j < height; j++) {
				this.cells[i][j] = new Cell();
			}
		}
	}

	public cellAt(pos: { x: number; y: number } | Position): Cell {
		var _pos: Position = pos instanceof Position ? pos : new Position(pos.x, pos.y);
		if (!this.isInField(_pos)) throw new Error('Not in a field');
		return this.cells[pos.x][pos.y];
	}
	public getWidth(): number {
		return this.width;
	}
	public getHeigth(): number {
		return this.height;
	}
	public isInField(pos: Position): Boolean {
		return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
	}
	public log(): void {
		let output = '';
		for (let j = 0; j < this.height; j++) {
			for (let i = 0; i < this.width; i++) {
				if (!this.cells[i][j].isAccessible() && !this.cells[i][j].isFinish()) output += 'x ';
				else if (this.cells[i][j].isEntityPlayer()) output += 'p ';
				else if (this.cells[i][j].isEntityEnemy()) output += 'e ';
				else if (!this.cells[i][j].isAccessible()) output += 'b ';
				else if (this.cells[i][j].isStart()) output += 's ';
				else if (this.cells[i][j].isFinish()) output += 'f ';
				else if (this.cells[i][j].hasItem()) output += 'i ';
				else output += '  ';
			}
			output += '\n';
		}
		console.log(output);
	}
	public removeEntity(entity: Entity): void {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				if (this.cells[i][j].getEntity() == entity) {
					this.cells[i][j].setEntity(null);
				}
			}
		}
	}
	public removeItem(item: Item): void {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				if (this.cells[i][j].getItem() == item) {
					this.cells[i][j].setItem(null);
				}
			}
		}
	}
}
