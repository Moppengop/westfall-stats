import { Injectable, signal } from '@angular/core';
import mockData from '../mock-data/data.json';
import { DroppedItems } from '../models/dropped_items';
import { Enemy } from '../models/enemy';
import { Item } from '../models/item';
import { KilledEnemy } from '../models/killed_enemy';
import { LoadedData, SaveData, SavedDrop, SavedKill } from '../models/save_data';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isItem(value: unknown): value is Item {
	return isRecord(value)
		&& typeof value['id'] === 'number'
		&& typeof value['name'] === 'string'
		&& typeof value['sell_price'] === 'number';
}

function isEnemy(value: unknown): value is Enemy {
	return isRecord(value)
		&& typeof value['id'] === 'number'
		&& typeof value['name'] === 'string'
		&& typeof value['level'] === 'number'
		&& typeof value['health'] === 'number';
}

function isSavedDrop(value: unknown): value is SavedDrop {
	return isRecord(value)
		&& typeof value['item_id'] === 'number'
		&& typeof value['amount'] === 'number';
}

function isSavedKill(value: unknown): value is SavedKill {
	return isRecord(value)
		&& typeof value['kill_number'] === 'number'
		&& typeof value['enemy_id'] === 'number'
		&& Array.isArray(value['dropped_items'])
		&& value['dropped_items'].every(isSavedDrop)
		&& typeof value['dropped_money'] === 'number';
}

@Injectable({ providedIn: 'root' })
export class MainService {
	// Set true to use the bundled mock data without reading or changing browser storage.
	readonly useMockData = false;
	private readonly storageKey = 'westfall-stats-data';
	readonly killedEnemies = signal<KilledEnemy[]>([]);

	loadData(): LoadedData {
		const data: SaveData = this.useMockData
			? mockData as SaveData
			: this.readSavedData() ?? { known_items: [], known_enemies: [], kills: [] };

		const loadedData = this.resolveData(data);
		this.killedEnemies.set(loadedData.killedEnemies);
		return loadedData;
	}

	saveData(knownItems: Item[], knownEnemies: Enemy[], killedEnemies: KilledEnemy[]): void {
		this.killedEnemies.set(killedEnemies);
		if (this.useMockData) {
			return;
		}

		this.writeSavedData(this.createSaveData(knownItems, knownEnemies, killedEnemies));
	}

	exportBackup(knownItems: Item[], knownEnemies: Enemy[], killedEnemies: KilledEnemy[]): string {
		return JSON.stringify(this.createSaveData(knownItems, knownEnemies, killedEnemies), null, 2);
	}

	importBackup(contents: string): LoadedData {
		const data: unknown = JSON.parse(contents);
		if (!this.isSaveData(data)) {
			throw new Error('The selected file is not a valid Westfall Stats backup.');
		}

		const loadedData = this.resolveData(data);
		this.saveData(loadedData.knownItems, loadedData.knownEnemies, loadedData.killedEnemies);
		return loadedData;
	}

	private createSaveData(knownItems: Item[], knownEnemies: Enemy[], killedEnemies: KilledEnemy[]): SaveData {
		return {
			known_items: knownItems.map(({ id, name, sell_price }) => ({ id, name, sell_price })),
			known_enemies: knownEnemies.map(({ id, name, level, health }) => ({ id, name, level, health })),
			kills: killedEnemies.map((kill) => ({
				kill_number: kill.kill_number,
				enemy_id: kill.enemy.id,
				dropped_items: kill.dropped_items.map((drop) => ({
					item_id: drop.item.id,
					amount: drop.amount,
				})),
				dropped_money: kill.dropped_money,
			})),
		};
	}

	private readSavedData(): SaveData | undefined {
		if (typeof localStorage === 'undefined') {
			return undefined;
		}

		try {
			const saved = localStorage.getItem(this.storageKey);
			if (!saved) {
				return undefined;
			}

			const data: unknown = JSON.parse(saved);
			if (!this.isSaveData(data)) {
				throw new Error('Saved data has an invalid format.');
			}
			return data;
		} catch (error) {
			console.warn('Could not load saved data; starting with empty data instead.', error);
			return undefined;
		}
	}

	private writeSavedData(data: SaveData): void {
		if (typeof localStorage === 'undefined') {
			return;
		}

		try {
			localStorage.setItem(this.storageKey, JSON.stringify(data));
		} catch (error) {
			console.error('Could not save data to browser storage.', error);
		}
	}

	private isSaveData(value: unknown): value is SaveData {
		if (!isRecord(value)) {
			return false;
		}

		return Array.isArray(value['known_items'])
			&& value['known_items'].every(isItem)
			&& Array.isArray(value['known_enemies'])
			&& value['known_enemies'].every(isEnemy)
			&& Array.isArray(value['kills'])
			&& value['kills'].every(isSavedKill);
	}

	private resolveData(data: SaveData): LoadedData {
		const knownItems = data.known_items.map((item) => ({ ...item }));
		const knownEnemies = data.known_enemies.map((enemy) => ({ ...enemy }));

		return {
			knownItems,
			knownEnemies,
			killedEnemies: data.kills
				.map((kill) => {
					const enemy = knownEnemies.find((knownEnemy) => knownEnemy.id === kill.enemy_id);

					if (!enemy) {
						return undefined;
					}

					const droppedItems: DroppedItems[] = kill.dropped_items
						.map((droppedItem) => {
							const item = knownItems.find((knownItem) => knownItem.id === droppedItem.item_id);

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
