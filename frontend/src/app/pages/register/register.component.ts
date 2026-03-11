import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  register() {
    const data = {
      name: this.name,
      email: this.email,
      password: this.password,
    };

    this.authService.register(data).subscribe(
      (res: any) => {
        console.log('Register success', res);

        alert('User registered successfully');
      },
      (err) => {
        console.error(err);
        alert('Register failed');
      },
    );
  }
}