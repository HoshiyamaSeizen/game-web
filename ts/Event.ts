export enum eType {
	hitEvent,
	castEvent,
	getHitEvent,
	deadEvent,
	breakEvent,
	noChargesEvent,
	restEvent,
	drinkEvent,
	dropEvent,
	pickUpEvent,
	findEvent,
	finishEvent,
	goalsNotMet,
	notEnoughMoney,
	missingKeyItem,
}
export enum sourceType {
	PLAYER,
	ENEMY,
	ITEM,
}

export class GameEvent {
	private source: sourceType;
	private type: eType;
	private numValue: number;
	private hp: number;
	private object: string;
	private subject: string;

	constructor(
		source: sourceType,
		type: eType,
		subject = 'you',
		object = 'you',
		numValue = 0,
		hp = 0
	) {
		this.source = source;
		this.type = type;
		this.subject = subject;
		this.object = object;
		this.numValue = numValue;
		this.hp = hp;
	}
	public getSource(): sourceType {
		return this.source;
	}
	public toString(): string {
		let result: string;
		switch (this.type) {
			case eType.hitEvent:
				result = `${this.subject} hit ${this.object} with ${this.numValue} damage`;
				break;
			case eType.castEvent:
				result = `${this.subject} casted a spell on ${this.object} dealing ${this.numValue} damage`;
				break;
			case eType.getHitEvent:
				result = `${this.subject} (${this.hp}) recieved ${this.numValue} damage`;
				break;
			case eType.deadEvent:
				result = `${this.subject} was slayed`;
				break;
			case eType.breakEvent:
				result = `your ${this.subject} is broken`;
				break;
			case eType.noChargesEvent:
				result = `your ${this.subject} has no charges left`;
				break;
			case eType.restEvent:
				result = `you rested and restored ${this.numValue} HP and SP`;
				break;
			case eType.drinkEvent:
				result = `you drank ${this.subject} and restored ${this.numValue} ${this.object}`;
				break;
			case eType.dropEvent:
				result = `you dropped your ${this.subject}`;
				break;
			case eType.pickUpEvent:
				result = `you picked up ${this.subject}`;
				break;
			case eType.findEvent:
				result = `you found ${this.subject}`;
				break;
			case eType.finishEvent:
				result = 'you reached the finish';
				break;
			case eType.goalsNotMet:
				result = 'you need to complete the goals';
				break;
			case eType.notEnoughMoney:
				result = `you don't have enough money. You need ${this.numValue}`;
				break;
			case eType.missingKeyItem:
				result = `you need ${this.subject} to proceed`;
				break;
			default:
				return ' ';
		}
		return result.charAt(0).toUpperCase() + result.slice(1);
	}
}
