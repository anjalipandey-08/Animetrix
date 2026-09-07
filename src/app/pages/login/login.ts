import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  async login() {

    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage =
        'Please enter your email and password.';
      return;
    }

    this.loading = true;

    try {

      await this.auth.login(
        this.email.trim(),
        this.password
      );

      const isAdmin =
        await this.auth.isAdmin();

      if (!isAdmin) {

        await this.auth.logout();

        this.errorMessage =
          'You do not have admin access.';

        return;
      }

      await this.router.navigate(['/admin']);

    } catch (error) {

      console.error('Login error:', error);

      this.errorMessage =
        'Invalid email or password.';

    } finally {

      this.loading = false;

    }
  }
}