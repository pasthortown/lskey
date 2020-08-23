import { CommunicationService } from './../services/communication.service';
import { Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  @ViewChild('screen_capture', { static: false }) screen_capture: any;
  image_data = "";
  image = new Image();
  pos_x = 0;
  pos_y = 0;
  screen_capture_width = 0;
  screen_capture_height = 0;
  screen_width = 0;
  screen_height = 0;

  constructor(private communicationDataService: CommunicationService) {}

  ngOnInit() {
    this.start_realtime_communication();
  }

  ngOnDestroy() {
    this.communicationDataService.disconnect();
  }

  movedTouch(event) {
    this.pos_x = event.touches[0].pageX - 10;
    this.pos_y = event.touches[0].pageY - 67;
    if (this.pos_x < 0) {
      this.pos_x = 0;
    }
    if (this.pos_x > this.screen_capture_width) {
      this.pos_x = this.screen_capture_width;
    }
    if (this.pos_y < 0) {
      this.pos_y = 0;
    }
    if (this.pos_y > this.screen_capture_height) {
      this.pos_y = this.screen_capture_height;
    }
  }

  start_realtime_communication() {
    this.communicationDataService.connect();
    this.communicationDataService.listen('message').subscribe( r => {
    });
    this.communicationDataService.listen('screen').subscribe( r => {
      this.image_data =  r.image;
      this.screen_capture_width = r.width;
      this.screen_capture_height = r.height;
      this.image.src = this.image_data;
    });
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

  send_context_menu() {
    this.send_key_sequence(["context_menu"]);
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

  sendData(payload) {
    this.communicationDataService.send('message', payload);
    console.log(payload);
  }

  pixelSelected(event) {
    this.pos_x = event.pageX - 10;
    this.pos_y = event.pageY - 67;
    if (this.pos_x < 0) {
      this.pos_x = 0;
    }
    if (this.pos_x > this.screen_capture_width) {
      this.pos_x = this.screen_capture_width;
    }
    if (this.pos_y < 0) {
      this.pos_y = 0;
    }
    if (this.pos_y > this.screen_capture_height) {
      this.pos_y = this.screen_capture_height;
    }
  }

  endSelected() {
    const current_width = this.screen_capture.nativeElement.width;
    const current_height = this.screen_capture.nativeElement.height;
    const x_to_send = this.pos_x * this.screen_capture_width / current_width;
    const y_to_send = this.pos_y * this.screen_capture_height / current_height;
    this.send_mouse_order("000", x_to_send, y_to_send);
  }
}
