import { CommunicationService } from './../services/communication.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  constructor(private communicationDataService: CommunicationService) {}

  ngOnInit() {
    this.start_realtime_communication();
  }

  ngOnDestroy() {
    this.communicationDataService.disconnect();
  }

  start_realtime_communication() {
    this.communicationDataService.connect();
    this.communicationDataService.listen('message').subscribe( r => {
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
}
