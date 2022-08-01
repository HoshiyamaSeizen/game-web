import {
	Strategy,
	GuardStrategy,
	WanderStrategy,
	HuntStrategy,
	PatrolStrategy,
} from './../Objects/Strategy';
import { Sprite } from './../Storage';
import { Enemy } from './../Objects/Enemy';
import { Builder } from './Builder';

import enemies from '../../public/data/enemies.json';
import { Position } from '../Positioning';

export class EnemyBuilder implements Builder {
	private enemy: Enemy;
	constructor() {
		this.enemy = new Enemy();
	}
	public setStrategy(strategy: Strategy): void {
		this.enemy.changeStrategy(strategy);
	}
	public setStats(maxHealth = 1, armor = 0, damage = 1, reward = 0): void {
		this.enemy = new Enemy(maxHealth, armor, damage, reward);
	}
	public setName(name: string): void {
		this.enemy.changeName(name);
	}
	public setSprite(sprite: Sprite): void {
		this.enemy.setSprite(sprite);
	}
	public buildPresetEnemy(name: string): void {
		let enemyInfo = enemies.find((enemy) => enemy.name == name)!;
		this.setStats(enemyInfo.hp, enemyInfo.def, enemyInfo.dam, enemyInfo.money);
		this.setName(enemyInfo.name);

		if (enemyInfo.strategy == 'guard') this.setStrategy(new GuardStrategy(this.enemy));
		else if (enemyInfo.strategy == 'wander') this.setStrategy(new WanderStrategy(this.enemy));
		else if (enemyInfo.strategy == 'hunt') this.setStrategy(new HuntStrategy(this.enemy));
		else if (enemyInfo.strategy == 'patrol') this.setStrategy(new PatrolStrategy(this.enemy));

		let image = new Image();
		image.src = `assets/objects/entities/${enemyInfo.name}.png`;
		this.setSprite({ source: image, pos: new Position(0, 0) });
	}

	public getPresetEnemy(name: string): Enemy {
		this.buildPresetEnemy(name);
		return this.getEnemy();
	}
	public getEnemy(): Enemy {
		let resultEnemy = this.enemy;
		this.reset();
		return resultEnemy;
	}
	public reset(): void {
		this.enemy = new Enemy();
	}
	public getEnemyList() {
		let enemyList: string[] = [];
		enemies.forEach((enemy) => {
			enemyList.push(enemy.name);
		});
		return enemyList;
	}
}
