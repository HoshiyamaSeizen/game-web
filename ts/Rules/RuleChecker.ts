import { Game } from './../Game';
import { RuleType, GameRule, TargetType, Condition } from './GameRule';

export const initStartRules = (fromSave = false): void => {
	Game.getInstance()
		.getRules()
		.forEach((rule) => {
			if (rule.target() == TargetType.ENTITY) {
				if (rule.name() == 'player' || rule.name() == 'all') {
					if (
						!(
							fromSave &&
							(rule.condition() == Condition.HP ||
								rule.condition() == Condition.MP ||
								rule.condition() == Condition.SP)
						)
					) {
						Game.getInstance().getPlayer().changeStat(rule.condition(), rule.value());
					}
				}
				Game.getInstance()
					.getEntities()
					.forEach((e) => {
						if (rule.name() == e.getName() || rule.name() == 'all') {
							if (!(fromSave && rule.condition() == Condition.HP)) {
								e.changeStat(rule.condition(), rule.value());
							}
						}
					});
			} else if (rule.target() == TargetType.ITEM) {
				Game.getInstance()
					.getItems()
					.forEach((i) => {
						if (rule.name() == i.getName() || rule.name() == 'all') {
							if (!(fromSave && rule.condition() == Condition.DUR)) {
								i.changeStat(rule.condition(), rule.value());
							}
						}
					});
			}
		});
};
export const checkFinishRules = (): Boolean => {
	return Game.getInstance()
		.getRules(false)
		.every((rule) => {
			let res = true;
			let count = 0;
			if (rule.target() == TargetType.ENTITY) {
				Game.getInstance()
					.getEntities()
					.forEach((e) => {
						if (rule.name() == e.getName() || rule.name() == 'all') {
							if (rule.condition() == Condition.COUNT) count++;
							else if (rule.condition() == Condition.KILL) res = false;
						}
					});
			} else if (rule.target() == TargetType.ITEM) {
			}

			if (rule.condition() == Condition.COUNT && count > rule.value()) res = false;
			return res;
		});
};
export const finishRulesToString = (): string[] => {
	let rules_str: string[] = [];
	Game.getInstance()
		.getRules(false)
		.forEach((rule) => {
			let str = '';
			switch (rule.condition()) {
				case Condition.COUNT:
					str = `No more than ${rule.value()} ${
						rule.name() == 'all' ? 'entities' : rule.name()
					}  on the map`;
					break;
				case Condition.KILL:
					str = `Kill every  ${rule.name() == 'all' ? 'entity' : rule.name()}  on the map`;
					break;
				default:
					break;
			}
			rules_str.push(str);
		});
	return rules_str;
};
export const parseRules = (args: string[]): void => {
	let type: RuleType;
	let target: TargetType;
	let name: string;
	let condition: Condition;
	let value: number;

	if (args[0] == 'start') type = RuleType.START;
	else type = RuleType.FINISH;

	if (args[1] == 'entity') target = TargetType.ENTITY;
	else if (args[1] == 'item') target = TargetType.ITEM;

	name = args[2];

	if (args[3] == 'hp') condition = Condition.HP;
	else if (args[3] == 'mhp') condition = Condition.MHP;
	else if (args[3] == 'mp') condition = Condition.MP;
	else if (args[3] == 'mmp') condition = Condition.MMP;
	else if (args[3] == 'sp') condition = Condition.SP;
	else if (args[3] == 'msp') condition = Condition.MSP;
	else if (args[3] == 'def') condition = Condition.DEF;
	else if (args[3] == 'dam') condition = Condition.DAM;
	else if (args[3] == 'money') condition = Condition.MONEY;
	else if (args[3] == 'cost') condition = Condition.COST;
	else if (args[3] == 'dur') condition = Condition.DUR;
	else if (args[3] == 'price') condition = Condition.PRICE;
	else if (args[3] == 'kill') condition = Condition.KILL;
	else if (args[3] == 'count') condition = Condition.COUNT;

	value = +args[4];

	Game.getInstance().addRule(
		new GameRule(type, target!, name, condition!, value),
		type == RuleType.START
	);
};
