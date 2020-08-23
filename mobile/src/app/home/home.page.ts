import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  show_mouse = true;
  mic_on = false;
  click_lock = false;

  constructor() {}

  change_mic() {
    this.mic_on = !this.mic_on;
  }
}
