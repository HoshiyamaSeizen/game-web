import { GameObject } from './Object';
export interface Item extends GameObject {
	changeName(name: string): void;

	getName(): string;
	getDur(): number;
	setDur(num: number): void;
	clone(): Item;
}
