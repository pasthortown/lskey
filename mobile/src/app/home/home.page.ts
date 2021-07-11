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
  
  image_data = null;
  pos_x = 0;
  pos_y = 0;
  screen_width = 0;
  screen_height = 0;
  image_width = 0;
  image_height = 0;
  ip_server = "192.168.100.15";
  connected = false;
  scrolling = false;

  url = '';

  constructor(
    private speechRecognition: SpeechRecognition, 
    private communicationDataService: CommunicationService, 
    private screenOrientation: ScreenOrientation
    ) {
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
  }

  check_alive() {
    this.url = 'http://' + this.ip_server + ':8080/';
    if (this.connected) {
      this.communicationDataService.get_screen_size(this.url).then( r => {
        this.screen_width = r.width;
        this.screen_height = r.height;
        this.connected = true;
        setTimeout(() => {
          this.check_alive();
        }, 1000);
      }).catch( e => {
        alert(JSON.stringify(e));
        this.connected = false;
      });
    }
  }

  stop_realtime_communication() {
    this.connected = false;
  }

  start_realtime_communication() {
    this.connected = true;
    this.check_alive();
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
    this.communicationDataService.send(this.url + "message", payload).then(r => {
    }).catch( e => { console.log(e); });
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
    this.sendData(message);
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
      }
    };
    this.sendData(message);
  }

  send_text(text) {
    let message = {
      type: "keyboard_special", 
      order: text,
      combination: false};
    this.sendData(message);
  }

  send_key_sequence(order) {
    let message = {
      type: "keyboard", 
      order: order,
      combination: false};
    this.sendData(message);
  }

  send_key_combination(order) {
    let message = {
      type: "keyboard", 
      order: order,
      combination: true};
    this.sendData(message);
  }
}
