import { Component, OnInit, ViewChild } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

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
  ip_server = "192.168.1.23";
  connected = false;
  scrolling = false;

  constructor(private speechRecognition: SpeechRecognition, private communicationDataService: CommunicationService, private screenOrientation: ScreenOrientation) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.checkPermission();
  }

  checkPermission() {
    this.speechRecognition.hasPermission().then((permission)=>{
      if(!permission){
        this.requestPermission();
      }
    }, (err)=>{
      //ignored
    });
  }

  requestPermission(){
    this.speechRecognition.requestPermission().then((data)=>{
    }, (err)=>{
      //ignored
    });
  }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    this.communicationDataService.disconnect();
  }

  start_listening() {
    const options = {
      language: "es-ES",
      //showPartial: true,
      //showPopup: false,
    };
    if (this.mic_on) {
      this.speechRecognition.startListening(options).subscribe(
        (matches: string[]) => {
          this.send_text(matches[0]);
          this.speechRecognition.stopListening();
          this.mic_on = false;
        },
        (onerror) => {
          //ignored
        }
      );
    } else {
      this.speechRecognition.stopListening();
    }
  }
  
  change_mic() {
    this.mic_on = !this.mic_on;
    this.start_listening();
  }

  start_realtime_communication() {
    this.communicationDataService.disconnect();
    this.communicationDataService.connect(this.ip_server);
    this.communicationDataService.listen('screen').subscribe( r => {
      const response = JSON.parse(r);
      this.image_data =  "data:image/png;base64," + response.data;
      this.screen_width = response.width;
      this.screen_height = response.height;
    });
    this.connected = true;
  }

  shitch_mouse() {
    this.show_mouse = !this.show_mouse;
    if (this.show_mouse) {
      this.request_screen();
    }
  }

  request_screen() {
    if (this.show_mouse) {
      let message = {
        type: "screen"
      };
      let payload = {to: "message", message: message}; 
      this.sendData(payload);
      setTimeout(() => {
        this.request_screen();
      }, 2000);
    }
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

  scroll(direction, start) {
    if (start == true) {
      this.scrolling = true;
    }
    let message = {
      type: "scroll", 
      order: {
        direction: direction
      }};
    let payload = {to: "message", message: message}; 
    this.sendData(payload);
    if (this.scrolling) {
      setTimeout(() => {
        this.scroll(direction, false)
      }, 200);
    }
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
