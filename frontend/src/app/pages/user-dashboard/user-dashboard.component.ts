import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, TaskListComponent],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent {}