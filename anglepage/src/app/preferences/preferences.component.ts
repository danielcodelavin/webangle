import { Component, OnInit } from '@angular/core';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  numberOfUFOs: number = 1;  // Default is 1
  timeInSeconds: number = 60;  // Default is 60 seconds
  isLoggedIn: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Available options as per requirements
  ufoOptions: number[] = [1, 2, 3, 4, 5];
  timeOptions: number[] = [60, 120, 180];

  constructor(
    private preferencesService: PreferencesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    // Load local preferences by default
    const storedUfos = localStorage.getItem('numUfos');
    const storedTime = localStorage.getItem('playTime');
    if (storedUfos) {
      const ufos = parseInt(storedUfos);
      if (this.ufoOptions.includes(ufos)) {
        this.numberOfUFOs = ufos;
      }
    }
    if (storedTime) {
      const time = parseInt(storedTime);
      if (this.timeOptions.includes(time)) {
        this.timeInSeconds = time;
      }
    }
  }

  saveLocal(): void {
    localStorage.setItem('numUfos', this.numberOfUFOs.toString());
    localStorage.setItem('playTime', this.timeInSeconds.toString());
    this.successMessage = 'Preferences saved locally';
    setTimeout(() => this.successMessage = '', 3000);
  }

  saveServer(): void {
    if (!this.isLoggedIn) return;

    const username = localStorage.getItem('username');
    if (!username) return;

    this.preferencesService.savePreferences(username, {
      numufos: this.numberOfUFOs,
      time: this.timeInSeconds
    }).subscribe({
      next: () => {
        this.successMessage = 'Preferences saved to server';
        setTimeout(() => this.successMessage = '', 3000);
        this.saveLocal(); // Also save locally
      },
      error: (error: Error) => {
        console.error('Error saving preferences:', error);
        this.errorMessage = 'Failed to save preferences to server';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getFromServer(): void {
    if (!this.isLoggedIn) return;

    const username = localStorage.getItem('username');
    if (!username) return;

    this.preferencesService.getPreferences(username).subscribe({
      next: (prefs: any) => {
        if (prefs.ufos && this.ufoOptions.includes(prefs.ufos)) {
          this.numberOfUFOs = prefs.ufos;
        }
        if (prefs.time && this.timeOptions.includes(prefs.time)) {
          this.timeInSeconds = prefs.time;
        }
        this.saveLocal(); // Save to localStorage
        this.successMessage = 'Preferences loaded from server';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: Error) => {
        console.error('Error loading preferences:', error);
        this.errorMessage = 'Failed to load preferences';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}