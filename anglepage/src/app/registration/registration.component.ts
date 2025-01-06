// src/app/registration/registration.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/']);
    }
  }

  checkUsername() {
    if (this.username) {
      if (this.username.length > 8) {
        this.errorMessage = 'Username must be maximum 8 characters';
        return;
      }

      this.http.get(`http://wd.etsisi.upm.es:10000/users/${this.username}`).subscribe({
        next: () => {
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

    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // Create URLSearchParams for urlencoded format
    const formData = new URLSearchParams();
    formData.append('username', this.username);
    formData.append('email', this.email);
    formData.append('password', this.password);

    this.http.post('http://wd.etsisi.upm.es:10000/users',
      formData.toString(),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }
    ).subscribe({
      next: () => {
        this.successMessage = 'Registration successful!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage = 'Username already exists';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid registration data';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        console.error('Registration error:', error);
      }
    });
  }
}