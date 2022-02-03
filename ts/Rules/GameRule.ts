export enum RuleType {
	START,
	FINISH,
}
export enum TargetType {
	ENTITY,
	ITEM,
}
export enum Condition {
	HP,
	MHP,
	MP,
	MMP,
	SP,
	MSP,
	DEF,
	DAM,
	MONEY,
	COST,
	DUR,
	PRICE,
	COUNT,
	KILL,
}

export class GameRule {
	private _type: RuleType;
	private _target: TargetType;
	private _name: string;
	private _condition: Condition;
	private _value: number;

	constructor(
		type: RuleType,
		target: TargetType,
		name: string,
		condition: Condition,
		value: number
	) {
		this._type = type;
		this._target = target;
		this._name = name;
		this._condition = condition;
		this._value = value;
	}
	public type(): RuleType {
		return this._type;
	}
	public target(): TargetType {
		return this._target;
	}
	public name(): string {
		return this._name;
	}
	public condition(): Condition {
		return this._condition;
	}
	public value(): number {
		return this._value;
	}
}
