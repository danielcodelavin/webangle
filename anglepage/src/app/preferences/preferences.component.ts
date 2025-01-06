// src/app/preferences/preferences.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PreferencesService } from '../services/services/preferences.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  numberOfUFOs: number = 3;
  timeInSeconds: number = 60;
  isLoggedIn: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private preferencesService: PreferencesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    if (this.isLoggedIn) {
      this.loadPreferences();
    }
  }

  loadPreferences() {
    const username = localStorage.getItem('username');
    if (!username) return;

    this.preferencesService.getPreferences(username).subscribe({
      next: (prefs: any) => {
        this.numberOfUFOs = prefs.ufos;
        this.timeInSeconds = prefs.time;
        
        // Save to localStorage for the play component
        localStorage.setItem('numUfos', prefs.ufos.toString());
        localStorage.setItem('playTime', prefs.time.toString());
      },
      error: (error) => {
        console.error('Error loading preferences:', error);
        this.errorMessage = 'Failed to load preferences';
      }
    });
  }

  saveLocal() {
    localStorage.setItem('numUfos', this.numberOfUFOs.toString());
    localStorage.setItem('playTime', this.timeInSeconds.toString());
    this.successMessage = 'Preferences saved locally';
    setTimeout(() => this.successMessage = '', 3000);
  }

  saveServer() {
    if (!this.isLoggedIn) return;

    const username = localStorage.getItem('username');
    if (!username) return;

    this.preferencesService.savePreferences(username, {
      ufos: this.numberOfUFOs,
      time: this.timeInSeconds
    }).subscribe({
      next: () => {
        this.successMessage = 'Preferences saved to server';
        setTimeout(() => this.successMessage = '', 3000);
        this.saveLocal(); // Also save locally
      },
      error: (error) => {
        console.error('Error saving preferences:', error);
        this.errorMessage = 'Failed to save preferences to server';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getFromServer() {
    this.loadPreferences();
  }
}