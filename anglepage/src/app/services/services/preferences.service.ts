// src/app/services/preferences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private serverUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getPreferences(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');
    
    return this.http.get(`${this.serverUrl}/preferences/${username}`, { headers });
  }

  savePreferences(username: string, preferences: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');
    
    return this.http.post(`${this.serverUrl}/preferences/${username}`, preferences, { headers });
  }
}