import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: any, password: any) {
    return this.http.post('http://localhost:5000/api/auth/login', {
      email: email,
      password: password,
    });
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}
