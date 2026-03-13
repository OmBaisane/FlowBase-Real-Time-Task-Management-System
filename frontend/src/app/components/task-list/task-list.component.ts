import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Parent components can increment this to force a reload (e.g. after
   * task creation via the form). ngOnChanges ignores the initial binding.
   */
  @Input() refresh = 0;

  tasks: any[] = [];
  filteredTasks: any[] = [];
  user: any = null;
  isAdmin = false;
  filterStatus = '';
  filterPriority = '';
  searchQuery = '';
  loading = true;

  stats = { total: 0, todo: 0, inProgress: 0, completed: 0 };

  private subs: Subscription[] = [];

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.isAdmin = this.authService.isAdmin();

    // Set up socket listeners BEFORE the initial HTTP load.
    // This guarantees that any real-time event that arrives while the HTTP
    // response is in-flight is not dropped.
    this.setupSocketListeners();

    // Initial data load — this is the authoritative first fetch.
    this.loadTasks();
  }

  /**
   * Parent signals a reload by incrementing [refresh].
   * Ignore the first change (initialisation binding).
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refresh'] && !changes['refresh'].firstChange) {
      this.loadTasks();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ─── Socket ────────────────────────────────────────────────────────────────

  private setupSocketListeners(): void {
    // All three events do a full reload from the API.
    // This is intentional: it keeps the task list perfectly in sync with
    // the server without having to manually merge optimistic updates, handle
    // edge cases where the local state diverges, or worry about ordering.
    this.subs.push(
      this.socketService.taskCreated$.subscribe(() => this.loadTasks()),
      this.socketService.taskUpdated$.subscribe(() => this.loadTasks()),
      this.socketService.taskDeleted$.subscribe(() => this.loadTasks()),
    );
  }

  // ─── Data ──────────────────────────────────────────────────────────────────

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
        this.applyFilter();
        this.calculateStats();
        // Manually trigger change detection so the view updates immediately
        // even if Angular's zone hasn't caught the async callback yet.
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private calculateStats(): void {
    this.stats.total = this.tasks.length;
    this.stats.todo = this.tasks.filter((t) => t.status === 'todo').length;
    this.stats.inProgress = this.tasks.filter((t) => t.status === 'in-progress').length;
    this.stats.completed = this.tasks.filter((t) => t.status === 'completed').length;
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredTasks = this.tasks.filter((t) => {
      const statusMatch = !this.filterStatus || t.status === this.filterStatus;
      const prioMatch = !this.filterPriority || t.priority === this.filterPriority;
      const searchMatch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q);
      return statusMatch && prioMatch && searchMatch;
    });
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  updateStatus(task: any, status: string): void {
    // Optimistic update for instant UI feedback, then let the socket
    // event trigger the authoritative reload from the server.
    const idx = this.tasks.findIndex((t) => t._id === task._id);
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], status };
      this.tasks = [...this.tasks];
      this.applyFilter();
      this.calculateStats();
    }
    this.taskService.updateTask(task._id, { status }).subscribe({
      error: () => this.loadTasks(), // roll back on error
    });
  }

  deleteTask(id: string): void {
    if (!confirm('Delete this task?')) return;
    // Optimistic removal
    this.tasks = this.tasks.filter((t) => t._id !== id);
    this.applyFilter();
    this.calculateStats();
    this.taskService.deleteTask(id).subscribe({
      error: () => this.loadTasks(), // roll back on error
    });
  }

  // ─── View helpers ──────────────────────────────────────────────────────────

  getPriorityColor(priority: string): string {
    const map: Record<string, string> = {
      high:   'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20',
      medium: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
      low:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
    };
    return map[priority] ?? 'text-slate-500 bg-slate-100 dark:bg-slate-700';
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'todo':        'text-slate-600 bg-slate-100 dark:bg-slate-700/60 dark:text-slate-300 border border-slate-200 dark:border-slate-600/40',
      'in-progress': 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
      'completed':   'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
    };
    return map[status] ?? 'text-slate-500 bg-slate-100';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'todo':        'Todo',
      'in-progress': 'In Progress',
      'completed':   'Completed',
    };
    return map[status] ?? status;
  }

  getPriorityDot(priority: string): string {
    const map: Record<string, string> = {
      high:   'bg-red-500',
      medium: 'bg-amber-400',
      low:    'bg-emerald-500',
    };
    return map[priority] ?? 'bg-slate-400';
  }

  trackByTaskId(_: number, task: any): string {
    return task._id;
  }

  getDueDateStatus(dueDate: string, status: string): { label: string; cls: string } | null {
    if (!dueDate || status === 'completed') return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.setHours(0, 0, 0, 0)) / 86400000);
    if (diffDays < 0)  return { label: 'Overdue',          cls: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20' };
    if (diffDays === 0) return { label: 'Due today',        cls: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' };
    if (diffDays <= 2)  return { label: `Due in ${diffDays}d`, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' };
    return {
      label: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      cls: 'text-slate-500 bg-slate-100 dark:bg-slate-700/60 dark:text-slate-400 border border-slate-200 dark:border-slate-600/40',
    };
  }
}
