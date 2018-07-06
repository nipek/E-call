import { Component } from '@angular/core';
import { ToastController  } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { NgZone } from '@angular/core';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Contact, ContactField, ContactName, Contacts, ContactFindOptions, ContactFieldType } from "@ionic-native/contacts";
import { BackgroundMode } from '@ionic-native/background-mode';
import { CallNumber } from '@ionic-native/call-number';
import { SMS } from '@ionic-native/sms';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  //these are variables
  isListening: boolean = false;
 // matches: Array<String>;
  matches: string;
  pno: string;
  check: string;
  word: string[];
  text: string;
  url: string;
  stream: any;
  promise: any;


  constructor(public toastCtrl: ToastController, public speech: SpeechRecognition, private zone: NgZone, private tts: TextToSpeech, private contacts: Contacts, private callNumber: CallNumber, private sms: SMS, private backgroundMode: BackgroundMode) {
    //this.url = "http://akalmultimedia.net:8000/GDNSLDH";
    this.url = "http://109.168.100.173:8058/;stream.mp3";
    this.stream = new Audio(this.url);
  }
  play() {
    if (this.stream == null) {
      this.url = "http://109.168.100.173:8058/;stream.mp3";
      this.stream.play();
    } else { 
          this.stream.play();

    };
   
    this.promise = new Promise((resolve, reject) => {
      this.stream.addEventListener('playing', () => {
        resolve(true);
      });

      this.stream.addEventListener('error', () => {
        reject(false);
      });
    });

    return this.promise;
  };

  pause() {
    if (this.stream != null) {
      this.stream.pause();
      this.stream.currentTime = 0;
      this.stream.src = "";
    };
  };
  ionViewDidLoad() {
    this.tts.speak({
      text: 'Hello  welcome to the E-call application,  Please click on screen to call using call   and then the person name  , for example call daddy    or text using text and then the person name for example text daddy or play radio using play',
      rate: 0.8
    })
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
    setTimeout(() => {    //<<<---    using ()=> syntax
      this.speech.isRecognitionAvailable()
        .then((result: boolean) => {
          if (result) {
            this.check = "Speech Recognition is Available on this device";
            this.tts.speak('Speech Recognition is Available on this device')
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          } else {
            this.check = "Sorry, Speech Recognition is not Available on this device";
            this.tts.speak('Sorry, Speech Recognition is not Available on this device')
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }
        });
    }, 15500);

    this.backgroundMode.enable();
    this.backgroundMode.on("activate").subscribe(() => {
      setTimeout(() => {    //<<<---    using ()=> syntax
       console.log("bg")
      }, 4000);
    });

  }

  ionViewWillUnload() {
    console.log("will unload ooo")
  }
  ionViewWillLeave() {
    console.log("will leae ooo")
   }

  listen(): void {
    console.log('listen action triggered');
    // if (this.isListening) {
    //   // this.speech.stopListening();
    //   this.toggleListenMode();
    //   return;
    // }

   // this.toggleListenMode();
   
    this.speech.startListening()
      .subscribe(match => {
        this.zone.run(() => {
          console.log(match[0]);
         // _this.matches = matches;
          this.matches = match[0]; 
          console.log('matched');
          this.word = match[0].split(" ");
          if (this.word[0] == 'play' || this.word[0] == 'Play') {
            this.play();
            console.log("played");
          } else if (this.word[0] == 'pause' || this.word[0] == 'Pause') {
            this.pause();
            console.log("paused");

          }else if (this.word[0] == 'Call' || this.word[0] == 'call' || this.word[0] == 'text' || this.word[0] == 'Text' ) {
              let toast = this.toastCtrl.create({
            message: 'Searching for Contact ' + match[0],
            duration: 4000,
            position: 'middle'
          });
          this.tts.speak('Searching for Contact ' + this.word[1])
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));
          toast.present();
          setTimeout(() => {  //<<<---    using ()=> syntax
            
            this.findContacts(match[0]);
          }, 4000);
          }else {
            this.tts.speak('Say the unknown number after the beep')
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
            setTimeout(() => {    //<<<---    using ()=> syntax
              this.speech.startListening()
                .subscribe(match => {
                  this.zone.run(() => {
                    console.log(match[0]);
                    // _this.matches = matches;
                    this.matches = match[0];
                    let toast = this.toastCtrl.create({
                      message: 'Calling ' + match[0],
                      duration: 4000,
                      position: 'middle'
                    });
                    toast.present();
                    this.tts.speak('Calling ' + match[0])
                      .then(() => console.log('Success'))
                      .catch((reason: any) => console.log(reason));
                    setTimeout(() => {    //<<<---    using ()=> syntax
                      this.callthenumber(match[0])
                    }, 6000);
                  })
                }, error => console.error(error));
            }, 3000);
          }
           
          
         
           
           
          
            
        })
      }, error => console.error(error));

  }

  // toggleListenMode(): void {
  //   this.isListening = this.isListening ? false : true;
  //   console.log('listening mode is now : ' + this.isListening);
  // }

  findContacts(nam: string) {
    this.word = nam.split(" ");
    console.log(this.word)
    const options = new ContactFindOptions();
    options.filter = this.word[1];
    options.multiple = false;
    options.hasPhoneNumber = true;
    const fields: ContactFieldType[] = ['addresses', 'birthday', 'categories', 'country',
      'department', 'displayName', 'emails', 'familyName', 'formatted',
      'givenName', 'honorificPrefix', 'honorificSuffix', 'id', 'ims', 'locality',
      'middleName', 'name', 'nickname', 'note', 'organizations', 'phoneNumbers',
      'photos', 'postalCode', 'region', 'streetAddress', 'title', 'urls'];
    this.contacts.find(fields, options)
      .then((success) => {
        let toast = this.toastCtrl.create({
          message: 'Found Contact ' + nam + '. Number is ' + success[0].phoneNumbers[0].value,
          duration: 4000,
          position: 'middle' 
        });
        let toas = this.toastCtrl.create({
          message: 'Could not Find Contact ' + nam +' Click screen to try again.',
          duration: 2000,
          position: 'middle'
        });
      
       
        if (success.length < 1) {
          toas.present();
          this.tts.speak('Could not Find Contact ' + this.word[1] +' Click screen to try again.')
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));
        } else {
         
          if (this.word[0] == 'Call' || this.word[0] == 'call'){
          console.log(success[0].phoneNumbers[0].value) 
          toast.present();
            this.tts.speak('Found Contact ' + this.word[1] + '. Calling at ' + success[0].phoneNumbers[0].value)
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));
          setTimeout(() => {    //<<<---    using ()=> syntax
            this.callthenumber(success[0].phoneNumbers[0].value)
          }, 6000);
          } else if (this.word[0] == 'Text' || this.word[0] == 'text') {
            toast.present();
            this.tts.speak('Found Contact ' + this.word[1] + '. Texting at ' + success[0].phoneNumbers[0].value + '.. Say your message after the beep')
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
            setTimeout(() => {    //<<<---    using ()=> syntax
              this.speech.startListening()
                .subscribe(match => {
                  this.zone.run(() => {
                    console.log(match[0]);
                    // _this.matches = matches;
                    this.matches = match[0];
                   
                    this.textthenumber(success[0].phoneNumbers[0].value, match[0])

                  })
                }, error => console.error(error));
            }, 8000);
          }
        }
      
       
      })
      .catch((error) => {
        this.tts.speak('Could not Find Contact ' + this.word[1] + ' Click screen to try again.')
          .then(() => console.log('Success'))
          .catch((reason: any) => console.log(reason));
        let toas = this.toastCtrl.create({
          message: 'Could not Find Contact ' + this.word[1] + ' Click screen to try again. '+ error,
          duration: 2000,
          position: 'middle'
        });
        toas.present();
      });
  }
  callthenumber(no: string) {
    this.callNumber.callNumber(no, true)
      .then(() => console.log('called!'))
      .catch(() => console.log('not call'));
      

  };
  textthenumber(no: string, msg:string) {
    this.sms.send(no, msg)
      .then(() => {
        this.tts.speak('your message   ' + msg + '  was sent successfully')
        .then(() => console.log('Success'))
          .catch((reason: any) => console.log(reason));
      })
      .catch(() => console.log('not text'));

  };
}



