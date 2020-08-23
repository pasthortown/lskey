const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const Tray = electron.Tray;
const icon_path = path.join(__dirname, '/assets/images/lskeyapp.ico');
const Menu = electron.Menu;
const Jimp = require('jimp');
const express = require('express')();
const http = require('http').Server(express);
const io = require('socket.io')(http);
const port = process.env.PORT || 6400;

const keyboard_sender = require('node-key-sender');
// https://www.npmjs.com/package/node-key-sender

const robot = require('robotjs');

let win;
let tray = null;

let template_menu = [
  {
    label: 'Cerrar',
    click: () => {
      app.quit();
    }
  },
];

if (require('electron-squirrel-startup')) {
  app.quit();
}

function show_notification(title, type, content) {
  tray.displayBalloon({
    iconType: type,
    title: title,
    content: content
  });
}

function send_mouse(buttons, x, y) {
  if (x !== -1 && y !== -1) {
    robot.moveMouseSmooth(x, y);
  }
  if (buttons[0] == '1') {
    robot.mouseClick('left');
  }
  if (buttons[1] == '1') {
    robot.mouseClick('middle');
  }
  if (buttons[2] == '1') {
    robot.mouseClick('right');
  }
}

async function screen_catpure() {
  while (true) {
    const screen_capture_bitmap = robot.screen.capture();
    height = screen_capture_bitmap.height;
    width = screen_capture_bitmap.width;
    new Jimp({data: screen_capture_bitmap.image, width: width, height: height}, (err, image) => {
      image.resize(width * 0.25, height * 0.25).greyscale().getBase64(Jimp.MIME_PNG, (err,data)=> {
        io.emit('screen', {image: data, width: width, height: height});
      });
    });
    await sleep(500);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

function send_keyboard(keys, combination) {
  if (combination === true) {
    keyboard_sender.sendCombination(keys);
  } else {
    keyboard_sender.sendKeys(keys);
  }
}

function process_message(message) {
  if (message.type == 'mouse') {
    const order = message.order;
    send_mouse(order.buttons, order.x, order.y);
  }
  if (message.type == 'keyboard') {
    send_keyboard(message.order, message.combination);
  }
  if (message.type == 'backslash') {
    escribir_backslash();
  }
}

function escribir_backslash() {
  robot.typeString('\\\\');
}

const at_start = () => {
  robot.setMouseDelay(2);
  tray = new Tray(icon_path);
  const context_menu = Menu.buildFromTemplate(template_menu);
  tray.setContextMenu(context_menu);
  tray.setToolTip('LSKey');
  tray.on('click', (r) => {
    tray.popUpContextMenu();
  });

  express.get('/', (req, res) => {
    res.send('LSApp esperando dispositivos en el puerto ' + port);
  });

  http.listen(port, () => {
    show_notification('LSApp','info','Esperando dispositivos en el puerto ' + port);
  }); 

  screen_catpure();

  io.on('connect', (socket) => {
    //show_notification('Conexión','info','Dispositivo ' + socket.id + ' conectado');
  });

  io.on('connection', socket => {
    socket.on('disconnect', () => {
      //show_notification('Conexión','info','Dispositivo ' + socket.id + ' desconectado');
    });
    socket.on('message', payload => {
        process_message(payload.message);
    });
    // socket.on('offer', payload => {
    //     io.emit('offer', { signalData: payload.signalData, participant_caller_id: payload.participant_caller_id, participant_callee_id: payload.participant_callee_id });
    // });
    // socket.on('answer', payload => {
    //     io.emit('answer', { signalData: payload.signalData, participant_caller_id: payload.participant_caller_id, participant_callee_id: payload.participant_callee_id });
    // });  
  });
};

app.on('ready', at_start);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
  }
});