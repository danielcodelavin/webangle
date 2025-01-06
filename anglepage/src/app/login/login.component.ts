// src/app/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
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

  onSubmit() {
    // Using query parameters in URL, just like the working example
    const url = `http://wd.etsisi.upm.es:10000/users/login?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`;

    this.http.get(url, {
      observe: 'response'
    }).subscribe({
      next: (response: HttpResponse<any>) => {
        const token = response.headers.get('Authorization');
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('username', this.username);
          this.successMessage = 'Login successful!';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        } else {
          this.errorMessage = 'Token not found in response';
        }
      },
      error: (error) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }
}