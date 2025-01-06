// src/app/services/preferences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PreferencesService {
    private serverUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getPreferences(username: string): Observable<any> {
        return this.http.get(`${this.serverUrl}/preferences/${username}`);
    }

    savePreferences(username: string, preferences: any): Observable<any> {
        return this.http.post(`${this.serverUrl}/preferences/${username}`, preferences);
    }
}