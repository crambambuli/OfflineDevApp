import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-genderize',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    AsyncPipe,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './genderize.component.html',
  styleUrl: './genderize.component.scss'
})
export class GenderizeComponent {
  name: string;
  result$: Observable<GenderizeResult>;

  constructor(private http: HttpClient) {
  }

  onKeyPressed(event: KeyboardEvent) {
    if (event.code !== 'Enter' && this.result$) {
      this.result$ = undefined;
    }
  }

  fetchGender(name: string) {
    this.result$ = this.http.get<GenderizeResult>(`https://api.genderize.io?name=${name}`);
  }
}

interface GenderizeResult {
  count: number;
  name: string;
  gender: string;
  probability: number;
}
