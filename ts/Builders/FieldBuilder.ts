import { AssetStorage, Sprite } from './../Storage';
import { Position } from './../Positioning';
import { Entity } from './../Objects/Entity';
import { Field } from './../Map/Field';
import { Builder } from './Builder';
import { Item } from '../Objects/Item';
import { State } from '../Map/Cell';

import maps from '../../public/data/maps.json';

export class FieldBuilder implements Builder {
	private field: Field;
	private fromSave: Boolean;

	constructor(isLoadedFromSave = false) {
		this.field = new Field();
		this.fromSave = isLoadedFromSave;
	}

	public setSize(width: number, height: number): void {
		this.field = new Field(width, height);
	}
	public toggleCellAccessibility(pos: Position): void {
		if (this.field.cellAt(pos).isAccessible()) this.field.cellAt(pos).toggleAccessibility();
	}
	public setOutsideWalls(): void {
		for (let i = 0; i < this.field.getHeigth(); i++) {
			this.toggleCellAccessibility(new Position(0, i));
			this.toggleCellAccessibility(new Position(this.field.getWidth() - 1, i));
		}
		for (let i = 0; i < this.field.getWidth(); i++) {
			this.toggleCellAccessibility(new Position(i, 0));
			this.toggleCellAccessibility(new Position(i, this.field.getHeigth() - 1));
		}
	}
	public setStart(pos: Position): void {
		for (let i = 0; i < this.field.getWidth(); i++) {
			for (let j = 0; j < this.field.getHeigth(); j++) {
				if (this.field.cellAt(pos).isStart()) this.field.cellAt(pos).setState(State.normal);
			}
		}
		this.field.cellAt(pos).setState(State.start);
	}
	public setFinish(pos: Position): void {
		for (let i = 0; i < this.field.getWidth(); i++) {
			for (let j = 0; j < this.field.getHeigth(); j++) {
				if (this.field.cellAt(pos).isFinish()) this.field.cellAt(pos).setState(State.normal);
			}
		}
		this.field.cellAt(pos).setState(State.finish);
	}
	public setEntity(ent: Entity, pos: Position): void {
		this.field.cellAt(pos).setEntity(ent);
		ent.setPos(pos);
	}
	public setItem(item: Item, pos: Position): void {
		this.field.cellAt(pos).setItem(item);
		item.setPos(pos);
	}
	public canItemBeSet(pos: Position): Boolean {
		return this.field.isInField(pos) && !this.field.cellAt(pos).hasItem();
	}
	public canEntityBeSet(pos: Position): Boolean {
		return this.field.isInField(pos) && this.field.cellAt(pos).isFree();
	}
	public setSprite(sprite: Sprite, pos: Position): void {
		this.field.cellAt(pos).setSprite(sprite);
	}

	public buildPresetMap(name: string, assets: AssetStorage): void {
		let map = maps.find((m) => m.name == name)!;

		this.setSize(map.width, map.height);

		// Enemies
		// Items

		// Layout
		map.layout.forEach((row, j) => {
			row.split(' ').forEach((char, i) => {
				switch (char) {
					case 's':
						this.setStart(new Position(i, j));
						break;
					case 'f':
						this.setFinish(new Position(i, j));
						break;
					case 'b':
						this.toggleCellAccessibility(new Position(i, j));
						this.setFinish(new Position(i, j));
					case 'x':
						this.toggleCellAccessibility(new Position(i, j));
						break;
					case 'e':
						// if(!fromSave){
						// 	this.setEntity(enemyMap[enemies.front()].clone(), new Position(i, j));
						// 	enemies.pop();
						// }
						break;
					case 'i':
						// if(!fromSave){
						// 	this.setItem(itemMap[items.front()].clone(), new Position(i, j));
						// 	items.pop();
						// }
						break;
					default:
						break;
				}
			});
		});

		// Textures
		let tilesheet = assets.getTilesheets().get(map.tilesheet)!;
		let sprites: Sprite[] = [];
		map.sprites.forEach((sprite) => {
			sprites.push({ source: tilesheet, pos: new Position(sprite.x, sprite.y) });
		});
		map.spritesLayout.forEach((row, j) => {
			row.split(' ').forEach((id, i) => {
				this.setSprite(sprites[+id], new Position(i, j));
			});
		});

		// Rules
	}

	public getPresetMap(name: string, assets: AssetStorage): Field {
		this.buildPresetMap(name, assets);
		return this.getField();
	}
	public getField(): Field {
		let resultField = this.field;
		this.reset();
		return resultField;
	}
	public reset(): void {
		this.field = new Field();
	}
}
