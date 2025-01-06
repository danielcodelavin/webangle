// src/app/registration/registration.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  checkUsername() {
    if (this.username) {
      this.http.get(`http://wd.etsisi.upm.es:10000/users/${this.username}`)
        .subscribe({
          next: (response) => {
            this.errorMessage = 'Username already exists';
          },
          error: (error) => {
            if (error.status === 404) {
              this.errorMessage = '';
            }
          }
        });
    }
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const userData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post('http://wd.etsisi.upm.es:10000/users', userData)
      .subscribe({
        next: (response) => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = 'Registration failed. Please try again.';
          console.error('Registration error:', error);
        }
      });
  }
}