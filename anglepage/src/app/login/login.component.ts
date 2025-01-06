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

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    // Check if user is already logged in
    if (localStorage.getItem('token')) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    // Create URLSearchParams for urlencoded format
    const formData = new URLSearchParams();
    formData.append('username', this.username);
    formData.append('password', this.password);

    this.http.post('http://wd.etsisi.upm.es:10000/users/login',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        observe: 'response'
      }
    ).subscribe({
      next: (response: HttpResponse<any>) => {
        const token = response.headers.get('Authorization');
        if (token) {
          localStorage.setItem('token', token);
          // Change Login to Logout in the menu - you can use a service for this
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }
}