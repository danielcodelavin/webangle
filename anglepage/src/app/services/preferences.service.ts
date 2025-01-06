import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private apiUrl = 'http://wd.etsisi.upm.es:10000/users';

  constructor(private http: HttpClient) { }

  getPreferences(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');
    return this.http.get(`${this.apiUrl}/${username}/options`, { headers });
  }

  savePreferences(username: string, preferences: { numufos: number, time: number }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': token || '',
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const body = `numufos=${preferences.numufos}&time=${preferences.time}`;
    return this.http.patch(`${this.apiUrl}/${username}/options`, body, { headers });
  }
}