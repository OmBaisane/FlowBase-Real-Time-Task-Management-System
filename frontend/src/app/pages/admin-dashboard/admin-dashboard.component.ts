import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { DoughnutChartComponent } from '../../components/chart/doughnut-chart.component';
import { SocketService } from '../../services/socket.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    TaskFormComponent,
    TaskListComponent,
    DoughnutChartComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  /**
   * Incrementing this tells <app-task-list> to reload.
   * It is only used for the "form created a task" path; socket events
   * are handled inside TaskListComponent directly.
   */
  refreshTasks = 0;

  stats = { total: 0, todo: 0, inProgress: 0, completed: 0 };
  chartLabels = ['Todo', 'In Progress', 'Completed'];
  chartColors = ['#94a3b8', '#3b82f6', '#10b981'];

  private subs: Subscription[] = [];

  constructor(
    private socketService: SocketService,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    // Start the socket connection once. Idempotent — safe to call even if
    // another component already called it.
    this.socketService.connect();

    // Fetch dashboard stats immediately on load.
    this.loadStats();

    // Keep the chart in sync with real-time events.
    // TaskListComponent handles its own task array independently.
    this.subs.push(
      this.socketService.taskCreated$.subscribe(() => this.loadStats()),
      this.socketService.taskUpdated$.subscribe(() => this.loadStats()),
      this.socketService.taskDeleted$.subscribe(() => this.loadStats()),
    );
  }

  ngOnDestroy(): void {
    // Only unsubscribe from our own subscriptions.
    // DO NOT call socketService.disconnect() here — the socket is a
    // providedIn:'root' singleton shared across the whole app. Disconnecting
    // on page navigation would kill real-time updates for other components.
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

  /** Called by <app-task-form> after a successful POST. */
  onTaskCreated(): void {
    // The socket event (taskCreated) will drive the task list reload and
    // loadStats() automatically. We only bump refreshTasks as a fallback
    // for cases where the socket event arrives before the component is ready.
    this.refreshTasks++;
  }
}
