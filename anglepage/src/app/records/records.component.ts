// src/app/records/records.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {
  records: any[] = [];
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

    this.http.get('http://wd.etsisi.upm.es:10000/records', { headers })
      .subscribe({
        next: (data: any) => {
          this.records = data;
        },
        error: (error) => {
          this.errorMessage = 'Error loading records';
          console.error('Records error:', error);
        }
      });
  }
}