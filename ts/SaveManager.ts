import { Player } from './Objects/Player';
import { Field } from './Map/Field';
import { Entity } from './Objects/Entity';
import { FieldBuilder } from './Builders/FieldBuilder';
import { Position } from './Positioning';
import { Game } from './Game';
import { Condition } from './Rules/GameRule';
import { Item, Spell, Weapon, Armor, Potion } from './Objects/Item';
import { NPC } from './Objects/NPC';

export class SaveManager {
	public save(saveIndex: number): Boolean {
		try {
			let save: saveStructure = {
				map: '',
				entityCount: 0,
				entities: [],
				itemCount: 0,
				items: [],
				player: {
					x: 0,
					y: 0,
					hp: 0,
					sp: 0,
					mp: 0,
					money: 0,
					weapon: {
						name: '',
						dur: 0,
					},
					spell: {
						name: '',
						dur: 0,
					},
					armor: {
						name: '',
						dur: 0,
					},
					potion: {
						name: '',
						dur: 0,
					},
					keyItems: [],
				},
			};
			let game = Game.getInstance();
			let entities = game.getEntities();
			let items = game.getItems();
			let player = game.getPlayer();

			save.map = Game.getInstance().getCurrentMap();

			let count = 0;
			let pos: Position;
			entities.forEach((e) => {
				count++;
				pos = e.getPos();
				save.entities.push({
					name: e.getName(),
					x: pos.x,
					y: pos.y,
					hp: e instanceof NPC ? e.getPhraseIndex() : e.getHP(),
				});
			});
			save.entityCount = count;

			count = 0;
			items.forEach((i) => {
				count++;
				pos = i.getPos();
				save.items.push({
					name: i.getName(),
					x: pos.x,
					y: pos.y,
					dur: i.getDur(),
				});
			});
			save.itemCount = count;

			pos = player.getPos();
			save.player = {
				x: pos.x,
				y: pos.y,
				hp: player.getHP(),
				sp: player.getSP(),
				mp: player.getMP(),
				money: player.getMoney(),
				weapon: player.hasWeapon()
					? { name: player.getWeapon()!.getName(), dur: player.getWeapon()!.getDur() }
					: { name: 'None', dur: 0 },
				spell: player.hasSpell()
					? { name: player.getSpell()!.getName(), dur: player.getSpell()!.getDur() }
					: { name: 'None', dur: 0 },
				armor: player.hasArmor()
					? { name: player.getArmor()!.getName(), dur: player.getArmor()!.getDur() }
					: { name: 'None', dur: 0 },
				potion: player.hasPotion()
					? { name: player.getPotion()!.getName(), dur: player.getPotion()!.getDur() }
					: { name: 'None', dur: 0 },
				keyItems: player.getKeyItems(),
			};

			localStorage.setItem(`save ${saveIndex}`, JSON.stringify(save));
			game.msg(`Game saved\n`);
			return true;
		} catch (e) {
			let message: string;
			if (e instanceof Error) message = e.message;
			else message = String(e);
			Game.getInstance().msg(message);
			return false;
		}
	}
	public load(saveIndex: number): Boolean {
		try {
			let saveJSON = localStorage.getItem(`save ${saveIndex}`);
			if (!saveJSON) throw new Error('Error: Save not found');

			let save: saveStructure = JSON.parse(saveJSON);

			let game = Game.getInstance();
			let storage = game.getStorage();
			let builder = new FieldBuilder(true);
			builder.buildPresetMap(save.map, storage);

			let entities: Entity[] = [];
			let items: Item[] = [];
			let field: Field;
			let player: Player;

			let pos: Position;
			save.entities.forEach((e) => {
				let entity: Entity;
				if (storage.checkEnemy(e.name)) {
					entity = storage.getEnemies().get(e.name)!.clone();
					entity.changeStat(Condition.HP, e.hp);
				} else if (storage.checkNPC(e.name)) {
					entity = storage.getNPCs().get(e.name)!.clone();
					(<NPC>entity).setPhraseIndex(e.hp);
				} else throw new Error(`Entity ${e.name} not found`);

				pos = new Position(e.x, e.y);
				if (!builder.canEntityBeSet(pos)) throw new Error('Error while placing an entity');
				entity.setPos(pos);
				entities.push(entity);
				builder.setEntity(entity, pos);
			});

			save.items.forEach((i) => {
				if (!storage.checkItem(i.name)) throw new Error(`Error: Itme ${i.name} not found`);
				let item = storage.getItems().get(i.name)!.clone();
				item.changeStat(Condition.DUR, i.dur);

				pos = new Position(i.x, i.y);
				if (!builder.canItemBeSet(pos)) throw new Error('Error while placing an item');
				item.setPos(pos);
				items.push(item);
				builder.setItem(item, pos);
			});

			pos = new Position(save.player.x, save.player.y);
			if (!builder.canEntityBeSet(pos)) throw new Error('Error while placing a player');
			player = <Player>game.getPlayer().clone();
			player.setPos(pos);
			player.changeStat(Condition.HP, save.player.hp);
			player.changeStat(Condition.MP, save.player.mp);
			player.changeStat(Condition.SP, save.player.sp);
			player.changeStat(Condition.MONEY, save.player.money);

			field = builder.getField();

			let item = save.player.weapon;
			if (item.name != 'None') {
				if (!storage.checkItem(item.name))
					throw new Error(`Error: Item ${item.name} not found`);
				let weapon = <Weapon>storage.getItems().get(item.name)!.clone();
				weapon.changeStat(Condition.DUR, item.dur);
				player.setWeapon(weapon);
			}

			item = save.player.weapon;
			if (item.name != 'None') {
				if (!storage.checkItem(item.name))
					throw new Error(`Error: Itme ${item.name} not found`);
				let spell = <Spell>storage.getItems().get(item.name)!.clone();
				spell.changeStat(Condition.DUR, item.dur);
				player.setSpell(spell);
			}

			item = save.player.armor;
			if (item.name != 'None') {
				if (!storage.checkItem(item.name))
					throw new Error(`Error: Itme ${item.name} not found`);
				let armor = <Armor>storage.getItems().get(item.name)!.clone();
				armor.changeStat(Condition.DUR, item.dur);
				player.setArmor(armor);
			}

			item = save.player.potion;
			if (item.name != 'None') {
				if (!storage.checkItem(item.name))
					throw new Error(`Error: Itme ${item.name} not found`);
				let potion = <Potion>storage.getItems().get(item.name)!.clone();
				potion.changeStat(Condition.DUR, item.dur);
				player.setPotion(potion);
			}

			player.setKeyItems(save.player.keyItems);

			game.setMap(save.map, field, entities, items, player);
			game.msg(`Save ${saveIndex} loaded\n`);
			return true;
		} catch (e) {
			let message: string;
			if (e instanceof Error) message = e.message;
			else message = String(e);
			Game.getInstance().msg(message);
			return false;
		}
	}
}

type saveStructure = {
	map: string;
	entityCount: number;
	entities: { name: string; x: number; y: number; hp: number }[];
	itemCount: number;
	items: { name: string; x: number; y: number; dur: number }[];
	player: {
		x: number;
		y: number;
		hp: number;
		sp: number;
		mp: number;
		money: number;
		weapon: { name: string; dur: number };
		spell: { name: string; dur: number };
		armor: { name: string; dur: number };
		potion: { name: string; dur: number };
		keyItems: string[];
	};
};
