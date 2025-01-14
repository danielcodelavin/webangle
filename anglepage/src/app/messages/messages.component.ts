// src/app/messages/messages.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Message {
  msgId: number;
  origin: string;
  target: string;
  text: string;
  date: number;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  showConfirmDialog: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadMessages();
  }

  loadMessages() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', token);

    this.http.get<Message[]>('http://wd.etsisi.upm.es:10000/messages', { headers })
      .subscribe({
        next: (data) => {
          this.messages = data;
        },
        error: (error) => {
          this.errorMessage = 'Error loading messages';
          console.error('Messages error:', error);
        }
      });
  }

  confirmDelete() {
    this.showConfirmDialog = true;
  }

  cancelDelete() {
    this.showConfirmDialog = false;
  }

  deleteMessages() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (!token || !username) return;

    const headers = new HttpHeaders().set('Authorization', token);

    this.http.delete(`http://wd.etsisi.upm.es:10000/messages/${username}`, { headers })
      .subscribe({
        next: () => {
          this.successMessage = 'Messages deleted successfully';
          this.showConfirmDialog = false;
          this.loadMessages(); // Reload messages after deletion
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error deleting messages';
          this.showConfirmDialog = false;
          console.error('Delete error:', error);
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}