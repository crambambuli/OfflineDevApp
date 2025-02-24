import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { catchError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AgifyResult } from '../../service-worker/agify-result';

const JSON_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Component({
  selector: 'app-agify',
  imports: [
    FormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel
  ],
  templateUrl: './agify.component.html',
  styleUrl: './agify.component.scss'
})
export class AgifyComponent {
  name: string;
  age: number;

  constructor(private http: HttpClient) {}

  onKeyPressed(event: KeyboardEvent) {
    if (event.code !== 'Enter') {
      this.age = undefined;
    }
  }

  fetchAge(name: string) {
    console.log('###fetchAge: name=', name);
    this.http.get<AgifyResult>(`https://api.agify.io?name=${name}`).pipe(
      catchError((error) => {
        console.warn('###fetchAge: http.get fehlgeschlagen', error);
        throw error;
      })
    ).subscribe((agifyResult) => {
      console.log('fetchAge: agifyResult=', agifyResult);
      this.age = agifyResult.age;
    });
  }

  setAge(name: string, age: number) {
    console.log('###setAge: name=', name, 'age=', age);

    if (name && age) {
      const url = 'https://api.agify.io/set-age';
      const body = JSON.stringify(<AgifyResult>{ name, age });
      this.http.post<AgifyResult>(url, body, JSON_OPTIONS).pipe(
        catchError((error) => {
          console.warn('###setAge http.post fehlgeschlagen', error);
          throw error;
        })
      ).subscribe((agifyResult) => {
        console.log('setAge: agifyResult=', agifyResult);
        this.age = agifyResult.age;
      });
    }
  }
}

