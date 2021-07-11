import numpy as np
from flask import render_template, request, Response, Flask
import pyautogui
import pyperclip
import threading
import cv2
import base64
from mss import mss
import ctypes
import simplejson as json
from flask_cors import CORS

frame = None  
my_jpeg = None  
app = Flask(__name__)
CORS(app)

def get_frame():
    global frame, my_jpeg
    with mss() as sct:
        mon = sct.monitors[1]
        while True:
            img = sct.grab(mon)
            frame = np.array(img)
            ret, jpeg = cv2.imencode('.jpg', frame)
            my_jpeg = jpeg.tobytes()

def gen():
    while True:
        if not(my_jpeg is None):
            yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + my_jpeg + b'\r\n\r\n')

def process_message(msg):
    order_type = msg["type"] 
    if order_type == "mouse":
        buttons = msg["order"]["buttons"]
        x = msg["order"]["x"]
        y = msg["order"]["y"]
        send_mouse(buttons, x, y)
    if order_type == "scroll":
        direction = msg["order"]["direction"]
        move_scroll(direction)
    if order_type == "keyboard_special":
        text = msg["order"]
        pyperclip.copy(text)
        pyautogui.hotkey('ctrl','v')
    if order_type == "keyboard":
        keys = msg["order"]
        combination = msg["combination"]
        send_keyboard(keys, combination)

def move_scroll(direction):
    if (direction == 'up'):
        pyautogui.scroll(50)
    else:
        pyautogui.scroll(-50)

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

@app.route('/message', methods=['POST'])
def handle_message():
    msg = request.get_json(force=True)
    process_message(msg['message'])
    return json.dumps({'response': 'ok'})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/screen_size')
def alive():
    screen_size = pyautogui.size()
    return json.dumps({'width': screen_size[0],'height': screen_size[1]})

@app.route('/video_feed')
def video_feed():
    return Response(gen(),mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    ctypes.windll.user32.ShowWindow( ctypes.windll.kernel32.GetConsoleWindow(), 0 )
    video = threading.Thread(target=get_frame)
    video.start()
    web = threading.Thread(target=app.run(host='0.0.0.0', debug=False, port=8080))
    web.start()
    