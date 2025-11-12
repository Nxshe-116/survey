import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
 startSurvey(type: string) {
    alert(`Starting ${type.toUpperCase()} survey...`);
  }
}
