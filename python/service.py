from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
import base64
import simplejson as json
import time
import pyautogui

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('message')
def handle_message(msg):
    process_message(msg["message"])

def process_message(msg):
    order_type = msg["type"] 
    if order_type == "mouse":
        buttons = msg["order"]["buttons"]
        x = msg["order"]["x"]
        y = msg["order"]["y"]
        send_mouse(buttons, x, y)
    if order_type == "keyboard_special":
        text = msg["order"]
        pyautogui.write(text)
    if order_type == "screen":
        screen_capture()
    if order_type == "keyboard":
        keys = msg["order"]
        combination = msg["combination"]
        send_keyboard(keys, combination)

def send_mouse(buttons, x, y):
    if (x != -1 and y != -1):
        pyautogui.moveTo(x,y)
    if (buttons[0] == '1') :
        pyautogui.click(button='left')
    if (buttons[1] == '1') :
        pyautogui.click(button='middle')
    if (buttons[2] == '1') :
        pyautogui.click(button='right')

def send_keyboard(keys, combination):
    if (combination == True):
        for key in keys:
            pyautogui.keyDown(key)
        for key in keys[::-1]:
            pyautogui.keyUp(key)        
    else:
        for key in keys:
            pyautogui.press(key)

def screen_capture():
    screenshot = pyautogui.screenshot("d:\\lskey_temp\\screen.png")
    with open("d:\\lskey_temp\\screen.png", "rb") as img_file:
        encoded_string = base64.b64encode(img_file.read())
        screen_size = pyautogui.size()
        socketio.emit('screen', json.dumps({'width': screen_size[0],'height': screen_size[1], 'data': encoded_string}))

if __name__ == '__main__':
    socketio.run(app, host = '0.0.0.0', port=6400)