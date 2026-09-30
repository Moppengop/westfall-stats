import { Injectable, signal } from '@angular/core';
import mockData from '../mock-data/data.json';
import { DroppedItems } from '../models/dropped_items';
import { Enemy } from '../models/enemy';
import { Item } from '../models/item';
import { KilledEnemy } from '../models/killed_enemy';

interface MockDroppedItem {
	item_id: number;
	amount: number;
}

interface MockKill {
	kill_number: number;
	enemy_id: number;
	dropped_items: MockDroppedItem[];
	dropped_money: number;
}

interface MockData {
	known_items: Item[];
	known_enemies: Enemy[];
	kills: MockKill[];
}

@Injectable({ providedIn: 'root' })
export class MainService {
	readonly killedEnemies = signal<KilledEnemy[]>([]);

	setKilledEnemies(killedEnemies: KilledEnemy[]): void {
		this.killedEnemies.set(killedEnemies);
	}

	loadMockData(): {
		knownItems: Item[];
		knownEnemies: Enemy[];
		killedEnemies: KilledEnemy[];
	} {
		const data = mockData as MockData;

		return {
			knownItems: data.known_items,
			knownEnemies: data.known_enemies,
			killedEnemies: data.kills
				.map((kill) => {
					const enemy = data.known_enemies.find((knownEnemy) => knownEnemy.id === kill.enemy_id);

					if (!enemy) {
						return undefined;
					}

					const droppedItems: DroppedItems[] = kill.dropped_items
						.map((droppedItem) => {
							const item = data.known_items.find((knownItem) => knownItem.id === droppedItem.item_id);

							return item ? { item, amount: droppedItem.amount } : undefined;
						})
						.filter((droppedItem): droppedItem is DroppedItems => droppedItem !== undefined);

					return {
						kill_number: kill.kill_number,
						enemy,
						dropped_items: droppedItems,
						dropped_money: kill.dropped_money,
					};
				})
				.filter((kill): kill is KilledEnemy => kill !== undefined),
		};
	}
}
