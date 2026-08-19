import { Component, Input } from '@angular/core';
import { Enemy } from '../../../models/enemy';

@Component({
  selector: 'app-enemy-card',
  imports: [],
  templateUrl: './enemy-card.component.html',
  styleUrl: './enemy-card.component.scss',
})
export class EnemyCardComponent {
  @Input() enemy!: Enemy;
}
