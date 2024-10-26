from flask import Flask

app = Flask(__name__)
app.config.from_object('scheduleex.config')

import scheduleex.views
