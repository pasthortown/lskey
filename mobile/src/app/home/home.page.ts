import { Component, OnInit, ViewChild } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('screen_capture', { static: false }) screen_capture: any;
  
  show_mouse = false;
  mic_on = false;
  click_lock = false;
  
  image_data = "";
  pos_x = 0;
  pos_y = 0;
  screen_width = 0;
  screen_height = 0;
  image_width = 0;
  image_height = 0;

  constructor(private communicationDataService: CommunicationService, private screenOrientation: ScreenOrientation) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  ngOnInit() {
    this.start_realtime_communication();
  }

  ngOnDestroy() {
    this.communicationDataService.disconnect();
  }

  change_mic() {
    this.mic_on = !this.mic_on;
  }

  start_realtime_communication() {
    this.communicationDataService.connect();
    this.communicationDataService.listen('screen').subscribe( r => {
      this.image_data =  r.image;
      this.screen_width = r.width;
      this.screen_height = r.height;
    });
  }

  movedTouch(event) {
    this.image_width = this.screen_capture.nativeElement.width;
    this.image_height = this.screen_capture.nativeElement.height;
    this.pos_x = event.touches[0].pageX - 10;
    this.pos_y = event.touches[0].pageY - 276;
    if (this.pos_x < 0) {
      this.pos_x = 0;
    }
    if (this.pos_x > this.image_width) {
      this.pos_x = this.image_width;
    }
    if (this.pos_y < 0) {
      this.pos_y = 0;
    }
    if (this.pos_y > this.image_height) {
      this.pos_y = this.image_height;
    }
  }

  pixelSelected(event) {
    this.image_width = this.screen_capture.nativeElement.width;
    this.image_height = this.screen_capture.nativeElement.height;
    this.pos_x = event.pageX - 10;
    this.pos_y = event.pageY - 276;
    if (this.pos_x < 0) {
      this.pos_x = 0;
    }
    if (this.pos_x > this.image_width) {
      this.pos_x = this.image_width;
    }
    if (this.pos_y < 0) {
      this.pos_y = 0;
    }
    if (this.pos_y > this.image_height) {
      this.pos_y = this.image_height;
    }
  }

  endSelected() {
    this.image_width = this.screen_capture.nativeElement.width;
    this.image_height = this.screen_capture.nativeElement.height;
    const x_to_send = this.pos_x * this.screen_width / this.image_width;
    const y_to_send = this.pos_y * this.screen_height / this.image_height;
    if (this.click_lock) {
      this.send_mouse_order("100", x_to_send, y_to_send);
    } else {
      this.send_mouse_order("000", x_to_send, y_to_send);
    }
  }

  sendData(payload) {
    this.communicationDataService.send('message', payload);
  }

  send_mouse_order(buttons, x, y) {
    let message = {
      type: "mouse", 
      order: {
        buttons: buttons, 
        x:x, 
        y:y
      }};
    let payload = {to: "message", message: message}; 
    this.sendData(payload);
  }

  send_text(text) {
    let message = {
      type: "keyboard_special", 
      order: text,
      combination: false};
    let payload = {to: "message", message: message}; 
    this.sendData(payload);
  }

  send_key_sequence(order) {
    let message = {
      type: "keyboard", 
      order: order,
      combination: false};
    let payload = {to: "message", message: message}; 
    this.sendData(payload);
  }

  send_key_combination(order) {
    let message = {
      type: "keyboard", 
      order: order,
      combination: true};
    let payload = {to: "message", message: message}; 
    this.sendData(payload);
  }
}
