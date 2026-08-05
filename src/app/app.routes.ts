import { Routes } from '@angular/router';

import { InputComponent } from './components/input/input.component';
import { StatsComponent } from './components/stats/stats.component';

export const routes: Routes = [
    {
        path: '',
        component: InputComponent
    },
    {
        path: 'stats',
        component: StatsComponent
    }
];
