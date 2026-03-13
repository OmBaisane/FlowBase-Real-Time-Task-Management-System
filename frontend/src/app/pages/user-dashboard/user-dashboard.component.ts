import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { DoughnutChartComponent } from '../../components/chart/doughnut-chart.component';
import { SocketService } from '../../services/socket.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, TaskListComponent, DoughnutChartComponent],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  refreshTasks = 0;
  user: any = null;

  stats = { total: 0, todo: 0, inProgress: 0, completed: 0 };
  chartLabels = ['Todo', 'In Progress', 'Completed'];
  chartColors = ['#94a3b8', '#3b82f6', '#10b981'];

  private subs: Subscription[] = [];

  constructor(
    private socketService: SocketService,
    private taskService: TaskService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    // Start socket — idempotent singleton, safe to call multiple times.
    this.socketService.connect();

    // Fetch stats immediately on load — do not wait for a UI interaction.
    this.loadStats();

    // Keep chart in sync with real-time events.
    this.subs.push(
      this.socketService.taskCreated$.subscribe(() => this.loadStats()),
      this.socketService.taskUpdated$.subscribe(() => this.loadStats()),
      this.socketService.taskDeleted$.subscribe(() => this.loadStats()),
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe our own listeners only.
    // Do NOT disconnect the socket — it is a singleton service.
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadStats(): void {
    this.taskService.getStats().subscribe({
      next: (s) => (this.stats = s),
    });
  }

  get chartData(): number[] {
    return [this.stats.todo, this.stats.inProgress, this.stats.completed];
  }

  onTaskCreated(): void {
    this.refreshTasks++;
  }
}
