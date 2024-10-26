function hit_square(mouse_x, mouse_y, x1, y1, x2, y2) {
    return !(mouse_x < x1 | mouse_x > x2 | mouse_y < y1 | mouse_y > y2);
}

class CalendarDate {
    constructor(
        date,
        x,
        y,
        w,
        h,
        calendar,
        fill_color = "#eeeeee",
        font_color = "#222222"
    ) {
        this.date = date;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.calendar = calendar;
        this.fill_color = fill_color;
        this.font_color = font_color;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.fill_color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.restore();

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = this.font_color;
        ctx.strokeText(this.date.getDate(), this.x + this.w / 2, this.y + this.h / 2);
        ctx.restore();
    }

    onClicked(x, y) {
        if (hit_square(x, y, this.x, this.y, this.x + this.w, this.y + this.h)) {
            this.calendar.reserve(this.date);
            return true;
        }
    }
}

class CalendarMonthScrollButton {
    constructor(
        x,
        y,
        size,
        radius,
        text,
        on_clicked,
        color = "#222222"
    ) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = radius;
        this.text = text;
        this.on_clicked = on_clicked;
        this.color = color;
    }

    draw(ctx) {
        const k1 = this.size/2 - this.radius;
        const k2 = this.size/2;
        
        ctx.save();
        ctx.strokeStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(this.x - k1, this.y - k2);
        ctx.lineTo(this.x + k1, this.y - k2);
        ctx.arcTo(this.x + k2, this.y - k2, this.x + k2, this.y - k1, this.radius);
        ctx.lineTo(this.x + k2, this.y + k1);
        ctx.arcTo(this.x + k2, this.y + k2, this.x + k1, this.y + k2, this.radius);
        ctx.lineTo(this.x - k1, this.y + k2);
        ctx.arcTo(this.x - k2, this.y + k2, this.x - k2, this.y + k1, this.radius);
        ctx.lineTo(this.x - k2, this.y - k1);
        ctx.arcTo(this.x - k2, this.y - k2, this.x - k1, this.y - k2, this.radius);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(this.text, this.x, this.y);

        ctx.restore();
    }

    onClicked(x, y) {
        if (hit_square(x, y, this.x - this.size/2, this.y - this.size/2, this.x + this.size/2, this.y + this.size/2)) {
            this.on_clicked();
            return true;
        }
    }
}

class CalendarMonthHeader {
    constructor(
        height = 50
    ) {
        this.height = height;
    }

    draw(ctx, calendar) {
        const title = `${calendar.base_date.getFullYear()}年${calendar.base_date.getMonth() + 1}月`
        const width = calendar.body_width;

        ctx.save();
        ctx.fillStyle = "#eeeeee";
        ctx.fillRect(0, 0, width, this.height);
        ctx.restore();

        ctx.save();
        ctx.font = "20px sans-serif"
        ctx.textBaseline = "middle";
        ctx.fillText(title, 10, this.height / 2);
        ctx.strokeText(title, 10, this.height / 2);
        ctx.restore();

        this.buttons = [
            new CalendarMonthScrollButton(calendar.width - 64, this.height / 2 , 32, 4, "<", () => {
                let new_date = new Date(calendar.base_date.getTime());
                new_date.setMonth(new_date.getMonth() - 1);
                calendar.reload(new_date, calendar.canvas);
            }),
            new CalendarMonthScrollButton(calendar.width - 24, this.height / 2 , 32, 4, ">", () => {
                let new_date = new Date(calendar.base_date.getTime());
                new_date.setMonth(new_date.getMonth() + 1);
                calendar.reload(new_date, calendar.canvas);
            })
        ];

        for (let button of this.buttons) {
            button.draw(ctx);
            calendar.addListener(button);
        }
    }
}

class CalendarWeekDayHeader {
    constructor(
        height = 30
    ) {
        this.height = height;
        this.edge_color = "#555555";
    }

    draw(ctx, calendar) {
        const base_y = calendar.month_header.height;
        const weekday_width = calendar.calendar_date_width;
        const edge_width = calendar.calendar_date_edge_width;
        const width = calendar.body_width;

        ctx.save();
        ctx.fillStyle = "#eeeeee";
        ctx.fillRect(0, base_y, width, this.height);
        ctx.restore();

        ctx.save()
        ctx.strokeStyle = this.edge_color;
        for (let i = 0; i < 2; i++) {
            let y = base_y + i * (this.height);
            ctx.beginPath();
            ctx.lineWidth = edge_width;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();

        const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

        let x = weekday_width / 2;
        for (const weekday of weekdays) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokestyle = "black";
            if (weekday == "日") {
                ctx.strokeStyle = "red";
            }
            else if (weekday == "土") {
                ctx.strokeStyle = "blue";
            }
            ctx.strokeText(weekday, x, base_y + this.height / 2);
            ctx.restore();
            x += weekday_width
        }


    }
}

function is_same_date(date1, date2) { 
    return (
        date1.getFullYear() == date2.getFullYear() &
        date1.getMonth() == date2.getMonth() & 
        date1.getDate() == date2.getDate()
    )
}

function get_fill_color_of_date(date, today) {
    let fill_color = "#eeeeee";
    if (date < today | [0, 6].includes(date.getDay())) {
        fill_color = "#cccccc";
    }
    if (is_same_date(date, today)) {
        fill_color = "#87cefa";
    }
    return fill_color;
}

function get_font_color_of_date(date, month) {
    return date.getMonth() == month ? "#222222" : "#888888";
}

class Calendar {
    constructor(
        base_date,
        month_header,
        weekday_header,
        calendar_date_width = 80,
        calendar_date_height = 50,
        calendar_date_edge_width = 1,
        calendar_date_edge_color = "#aaaaaa",
    ){
        this.base_date = base_date;
        this.month_header = month_header;
        this.weekday_header = weekday_header;
        this.calendar_date_width = calendar_date_width;
        this.calendar_date_height = calendar_date_height;
        this.calendar_date_edge_width = calendar_date_edge_width;
        this.calendar_date_edge_color = calendar_date_edge_color;

        this.rows_max = 6;
        
        this.body_width = this.calendar_date_width * 7;
        this.body_height = this.calendar_date_height * this.rows_max;
        this.width = this.body_width;
        this.height = this.body_height + this.month_header.height + this.weekday_header.height;

        this.canvas = null;
        this.listener_list = [];
        this.reserved_dates = [];
    }

    create(canvas) {
        this.canvas = canvas;
        canvas.width = this.width;
        canvas.height = this.height;

        this.reload(this.base_date, canvas);
    }

    reload(base_date, canvas) {
        this.base_date = base_date;

        if (!canvas.getContext) {
            return;
        }

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        this.listener_list.splice(0);

        let start_date = new Date(base_date.getTime());
        start_date.setDate(1);
        start_date.setDate(start_date.getDate() - start_date.getDay());
        let end_date = new Date(start_date.getTime());
        end_date.setDate(start_date.getDate() + this.rows_max * 7);

        let date_periods  = (end_date - start_date) / 86400000;

        let x = 0;
        let y = this.month_header.height + this.weekday_header.height;
        let w = 0;
        let h = 0;

        let today = new Date();
        let month = this.base_date.getMonth();

        for (let i = 0; i < date_periods; i++) {
            let date = new Date(start_date.getTime());
            date.setDate(start_date.getDate() + i);
            w = this.calendar_date_width;
            h = this.calendar_date_height;
            let fill_color = get_fill_color_of_date(date, today);
            let font_color = get_font_color_of_date(date, month);

            for (const reserved_date of this.reserved_dates) {
                if (is_same_date(date, reserved_date)) {
                    fill_color = "#ea618e";
                }
            }

            let calendar_date = new CalendarDate(date, x, y, w, h, this, fill_color, font_color);
            calendar_date.draw(ctx);
            this.addListener(calendar_date);

            x += w;
            if (i % 7 == 6) {
                x = 0;
                y += this.calendar_date_height;
            }
        }

        ctx.save()
        ctx.lineWidth = this.calendar_date_edge_width;
        ctx.strokeStyle = this.calendar_date_edge_color;
        for (let i = 0; i < this.rows_max + 1; i++) {
            y = this.month_header.height + this.weekday_header.height + i * (this.calendar_date_height);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.body_width, y);
            ctx.closePath();
            ctx.stroke();
        }

        for (let i = 0; i < 7 + 1; i++) {
            x = i * (this.calendar_date_width);
            ctx.beginPath();
            ctx.moveTo(x, this.month_header.height + this.weekday_header.height);
            ctx.lineTo(x, this.month_header.height + this.weekday_header.height + this.body_height);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();

        this.month_header.draw(ctx, this);
        this.weekday_header.draw(ctx, this);
    }

    reserve(date) {
        for (const reserved_date of this.reserved_dates) {
            if (is_same_date(date, reserved_date)) {
                this.reserved_dates = this.reserved_dates.filter(x => x != reserved_date);
                this.reload(this.base_date, this.canvas);
                return;
            }
        }

        if (date < new Date() | [0, 6].includes(date.getDay())){
            return;
        }
        this.reserved_dates.push(date);
        this.reload(this.base_date, this.canvas);
    }

    addListener(listener) {
        this.listener_list.push(listener);
    }

    onClicked(e) {
        var rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (hit_square(x, y, 0, 0, this.width, this.height)) {
            for(let listener of this.listener_list) {
                if(listener.onClicked(x, y)){
                    break;
                }
            }
        }
    }
}

const canvas = document.getElementById("scheduleex");

let calendar = new Calendar(new Date(), new CalendarMonthHeader(), new CalendarWeekDayHeader);
calendar.create(canvas);
canvas.addEventListener('click', (e) => calendar.onClicked(e), false);
