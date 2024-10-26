from flask import render_template
from scheduleex import app

rows = 256
columns = 16
header = [f'header{column}' for column in range(columns)]
body = [[f'data[{row},{column}]' for column in range(columns)] for row in range(rows)]

table_data = {
    'header': header,
    'body': body
}

@app.route('/')
def index():
    return render_template('scheduleex/index.html', table_data=table_data)
