import {
	Strategy,
	GuardStrategy,
	WanderStrategy,
	HuntStrategy,
	PatrolStrategy,
} from './../Objects/Strategy';
import { Enemy } from './../Objects/Enemy';
import { Builder } from './Builder';
import { SpriteManager, Sprite } from '../Managers/SpriteManager';

import enemies from '../../public/data/enemies.json';
import { Game } from '../Game';

export class EnemyBuilder implements Builder {
	private enemy: Enemy;
	private spriteManager: SpriteManager;
	constructor() {
		this.enemy = new Enemy();
		this.spriteManager = Game.getInstance().getSpriteManager();
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
	public setSound(name: string): void {
		this.enemy.setSound(name);
	}
	public buildPresetEnemy(name: string): void {
		let enemyInfo = enemies.find((enemy) => enemy.name == name)!;
		this.setStats(enemyInfo.hp, enemyInfo.def, enemyInfo.dam, enemyInfo.money);
		this.setName(enemyInfo.name);

		if (enemyInfo.strategy == 'guard') this.setStrategy(new GuardStrategy(this.enemy));
		else if (enemyInfo.strategy == 'wander') this.setStrategy(new WanderStrategy(this.enemy));
		else if (enemyInfo.strategy == 'hunt') this.setStrategy(new HuntStrategy(this.enemy));
		else if (enemyInfo.strategy == 'patrol') this.setStrategy(new PatrolStrategy(this.enemy));

		this.setSprite(this.spriteManager.getSprite(enemyInfo.name));

		this.setSound(enemyInfo.sound);
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
