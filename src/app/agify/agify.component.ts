import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { catchError, EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AgifyResult } from '../../service-worker/agify-result';

@Component({
  selector: 'app-agify',
  imports: [
    AsyncPipe,
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
  result$: Observable<AgifyResult>;

  constructor(private http: HttpClient) {}

  onKeyPressed(event: KeyboardEvent) {
    if (event.code !== 'Enter' && this.result$) {
      this.result$ = undefined;
    }
  }

  fetchAge(name: string) {
    console.log('###fetchAge: name=', name);
    this.result$ = this.http.get<AgifyResult>(`https://api.agify.io?name=${name}`).pipe(
      catchError((e) => {
        console.warn('###fetchAge: http.get fehlgeschlagen', e);
        return EMPTY;
      })
    );
  }
}

