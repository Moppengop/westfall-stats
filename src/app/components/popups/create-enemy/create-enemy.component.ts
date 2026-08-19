import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface NewEnemyData {
  name: string;
  health: number;
  level: number;
}

@Component({
  selector: 'app-create-enemy',
  imports: [FormsModule],
  templateUrl: './create-enemy.component.html',
  styleUrl: './create-enemy.component.scss',
})
export class CreateEnemyComponent {
  @Output() submitted = new EventEmitter<NewEnemyData>();
  @Output() cancelled = new EventEmitter<void>();

  name = '';
  level: number | null = null;
  health: number | null = null;

  submit(): void {
    if (!this.name.trim() || this.level === null || this.health === null) {
      return;
    }

    this.submitted.emit({
      name: this.name.trim(),
      level: this.level,
      health: this.health,
    });
  }
}
