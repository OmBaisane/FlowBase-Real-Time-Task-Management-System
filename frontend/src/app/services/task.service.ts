import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  api = 'http://localhost:5000/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks() {
    return this.http.get(this.api);
  }

  createTask(task: any) {
    return this.http.post(this.api, task);
  }

  deleteTask(id: any) {
    return this.http.delete(`${this.api}/${id}`);
  }
}