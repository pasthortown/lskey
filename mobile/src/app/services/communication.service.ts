import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';

@Injectable({
   providedIn: 'root'
})
export class CommunicationService {
   options = null;

   constructor(private http: HTTP) {
      this.http.setDataSerializer('json');
      this.http.setServerTrustMode('nocheck');
      this.options = {"Content-Type": "application/json"};
   }
   
   send(url: string, message_content: any): Promise<any> {
      const to_send = {message: message_content};
      return this.http.post(url, to_send, this.options).then( r => {
         return JSON.parse(r.data);
      }).catch( e => {console. log(e); });
   }

   get_screen_size(url: string): Promise<any> {
      return this.http.get(url + 'screen_size',{},this.options).then( r => {
         return JSON.parse(r.data);
      }).catch( e => {console. log(e); });
   }
}