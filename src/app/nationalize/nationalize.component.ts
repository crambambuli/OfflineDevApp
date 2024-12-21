import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-nationalize',
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
  templateUrl: './nationalize.component.html',
  styleUrl: './nationalize.component.scss'
})
export class NationalizeComponent {
  name: string;
  result$: Observable<NationalizeResult>;

  constructor(private http: HttpClient) {}

  onKeyPressed(event: KeyboardEvent) {
    if (event.code !== 'Enter' && this.result$) {
      this.result$ = undefined;
    }
  }

  fetchNationality(name: string) {
    this.result$ = this.http.get<NationalizeResult>(`https://api.nationalize.io?name=${name}`);
  }
}

interface Country {
  country_id: string;
  probability: number
}

interface NationalizeResult {
  count: number;
  name: string;
  country: Country[]
}
