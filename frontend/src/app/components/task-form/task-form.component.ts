import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent {
  title: string = '';
  status: string = 'pending';

  constructor(private taskService: TaskService) {}

  addTask() {
    const task = {
      title: this.title,
      status: this.status,
    };

    this.taskService.createTask(task).subscribe(() => {
      this.title = '';
    });
  }
}