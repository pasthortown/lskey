import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class CommunicationService {

   private socket = null;

   constructor() {
   }

   connect(ip_server) {
      this.socket = io.connect('http://' + ip_server + ':6400/');
   }

   disconnect() {
      if (this.socket != null) {
         this.socket.io.disconnect();
      }
   }
   
   send(channel: string, payload: any) {
      this.socket.emit(channel, payload);
   }

   listen(channel: string): Observable<any> {
      return Observable.create((observer) => {
         this.socket.on(channel, (response) => {
            observer.next(response);
         });
      });
   }
}