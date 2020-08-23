import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class CommunicationService {

   url = environment.server_url;
   private socket;

   constructor() {
   }

   connect() {
      this.socket = io.connect(this.url);
   }

   disconnect() {
      this.socket.io.disconnect();
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