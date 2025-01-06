// src/app/preferences/preferences.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  numberOfUFOs: number = 3;
  timeInSeconds: number = 60;
  isLoggedIn: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.loadPreferences();
  }

  loadPreferences() {
    if (this.isLoggedIn) {
      this.http.get('http://localhost:3000/preferences', {
        headers: new HttpHeaders().set('Authorization', localStorage.getItem('token') || '')
      }).subscribe({
        next: (prefs: any) => {
          this.numberOfUFOs = prefs.ufos;
          this.timeInSeconds = prefs.time;
        },
        error: (error) => console.error('Error loading preferences:', error)
      });
    }
  }

  saveLocal() {
    localStorage.setItem('preferences', JSON.stringify({
      ufos: this.numberOfUFOs,
      time: this.timeInSeconds
    }));
  }

  saveServer() {
    if (!this.isLoggedIn) return;

    this.http.post('http://localhost:3000/preferences', {
      ufos: this.numberOfUFOs,
      time: this.timeInSeconds
    }, {
      headers: new HttpHeaders().set('Authorization', localStorage.getItem('token') || '')
    }).subscribe({
      next: () => console.log('Preferences saved to server'),
      error: (error) => console.error('Error saving preferences:', error)
    });
  }

  getFromServer() {
    this.loadPreferences();
  }
}