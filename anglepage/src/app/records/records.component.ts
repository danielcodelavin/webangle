// src/app/records/records.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Record {
  username: string;
  punctuation: number;
  ufos: number;
  disposedTime: number;
  recordDate: number;
}

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {
  records: Record[] = [];
  errorMessage: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Please login to view records';
      return;
    }

    const headers = new HttpHeaders().set('Authorization', token);

    this.http.get<Record[]>('http://wd.etsisi.upm.es:10000/records', { headers })
      .subscribe({
        next: (data) => {
          this.records = data;
        },
        error: (error) => {
          this.errorMessage = 'Error loading records';
          console.error('Records error:', error);
        }
      });
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}