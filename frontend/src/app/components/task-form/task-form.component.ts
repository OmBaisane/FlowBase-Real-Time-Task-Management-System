import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  @Output() taskCreated = new EventEmitter<void>();

  title = '';
  description = '';
  priority = 'medium';
  assignedTo = '';
  dueDate = '';
  users: any[] = [];
  isAdmin = false;
  loading = false;
  error = '';
  success = '';

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.userService.getUsers().subscribe({
        next: (u) => (this.users = u),
        error: () => {},
      });
    }
  }

  createTask() {
    if (!this.title.trim()) {
      this.error = 'Title is required';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    const data: any = {
      title: this.title.trim(),
      description: this.description.trim(),
      priority: this.priority,
      dueDate: this.dueDate || null,
    };
    if (this.isAdmin && this.assignedTo) {
      data.assignedTo = this.assignedTo;
    }

    this.taskService.createTask(data).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Task created!';
        this.title = '';
        this.description = '';
        this.priority = 'medium';
        this.assignedTo = '';
        this.dueDate = '';
        this.taskCreated.emit();
        setTimeout(() => (this.success = ''), 2500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to create task';
      },
    });
  }
}
