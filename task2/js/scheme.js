'use strict'
const select = document.querySelector('#acSelect');
const seatMapTitle = document.querySelector('#seatMapTitle');
const seatMapDiv = document.querySelector('#seatMapDiv');
const btnSeatMap = document.querySelector('#btnSeatMap');
const btnSetFull = document.querySelector('#btnSetFull');
const btnSetEmpty = document.querySelector('#btnSetEmpty');

const totalPax = document.querySelector('#totalPax');
const totalAdult = document.querySelector('#totalAdult');
const totalHalf = document.querySelector('#totalHalf');
var passengers;
let map = document.createDocumentFragment();

btnSetEmpty.setAttribute('disabled', true);
btnSetFull.setAttribute('disabled', true);
select.addEventListener('click', selectPlane);
btnSeatMap.addEventListener('click', btnHandler);
btnSetEmpty.addEventListener('click', btnHandler);
btnSetFull.addEventListener('click', btnHandler);

function selectPlane(e) {
    if (e.clientY == 0) {
        fetch('https://neto-api.herokuapp.com/plane/' + this.value)
            .then(res => res.json())
            .then(makeMap);
    }
}

const obj = {
    tag: 'div',
    class: ['row', 'seating-row', 'text-center'],
    children: [{
            tag: 'div',
            class: ['col-xs-1', 'row-number'],
            children: [{
                tag: 'h2',
                class: [''],
                text: '{index}'
            }]
        },
        {
            tag: 'div',
            class: ['col-xs-5'],
            repeat: 2,
            children: [{
                tag: 'div',
                class: ['col-xs-4', 'seat'],
                repeat: 'seats',
                children: [{
                    tag: 'span',
                    class: ['seat-label'],
                    text: '{letter}'
                }]
            }]
        }
    ]
}

function btnHandler(e) {
    e.preventDefault();
}

function showSeatMap(e) {
    seatMapDiv.appendChild(map);
    btnSeatMap.removeEventListener('click', showSeatMap);
    btnSetEmpty.removeAttribute('disabled');
    btnSetFull.removeAttribute('disabled');
    totalPax.textContent = 0;
    totalAdult.textContent = 0;
    totalHalf.textContent = 0;
    seatMapDiv.addEventListener('click', changeSeatStatus);
    btnSetEmpty.addEventListener('click', emptySeats);
    btnSetFull.addEventListener('click', fullSeats);
}

function changeSeatStatus(e) {
    let elem = e.target;
    var seat;
    let alt = e.altKey;
    if (elem.tagName == 'SPAN' && elem.classList.contains('seat-label')) {
        seat = elem.parentElement;
    } else if (elem.tagName == 'DIV' && elem.classList.contains('seat') && elem.children[0].classList.contains('seat-label')) {
        seat = elem;
    } else {
        return;
    }
    if (seat.classList.contains('adult') || seat.classList.contains('half')) {
        if (seat.classList.contains('adult')) {
            seat.classList.remove('adult');
            changeValues(totalPax, totalAdult, -1);
        }
        if (seat.classList.contains('half')) {
            seat.classList.remove('half');
            changeValues(totalPax, totalHalf, -1);
        }
    } else if (alt) {
        seat.classList.add('half');
        changeValues(totalPax, totalHalf, 1);
    } else {
        seat.classList.add('adult');
        changeValues(totalPax, totalAdult, 1);
    }
}

function changeValues(field1, field2, direction) {
    let val1 = parseInt(field1.textContent);
    let val2 = parseInt(field2.textContent);
    if (direction == -1) {
        field1.textContent = --val1;
        field2.textContent = --val2;
    }
    if (direction == 1) {
        field1.textContent = ++val1;
        field2.textContent = ++val2;
    }

}

function emptySeats() {
    Array.from(seatMapDiv.querySelectorAll('.seat-label:not(.half)'))
        .forEach(item => item.parentElement.className = 'col-xs-4 seat');
    totalPax.textContent = 0;
    totalAdult.textContent = 0;
    totalHalf.textContent = 0;
}

function fullSeats() {
    Array.from(seatMapDiv.querySelectorAll('.seat-label')).forEach(item => item.parentElement.classList.add('adult'));
    totalPax.textContent = passengers;
    totalAdult.textContent = passengers - totalHalf.textContent;
}

function makeMap(data) {
    cleanElement(seatMapDiv);
    passengers = data.passengers;
    seatMapTitle.textContent = data.title + ' (' + data.passengers + ' пассажиров)';
    let rows = data.scheme;
    let letters6 = data.letters6;
    if (data.letters4) {
        var letters4 = data.letters4;
    }
    console.log('data', data);
    rows.forEach((item, index) => {
        if (item == 6) {
            map.appendChild(makeRow(obj, item, index + 1, letters6));
        }
        if (item == 4) {
            map.appendChild(makeRow(obj, item, index + 1, letters4));
        }
        if (item == 0) {
            map.appendChild(makeRow(obj, item, index + 1, 0));
        }

    })
    btnSeatMap.addEventListener('click', showSeatMap);
}

function makeRow(obj, seats, index, letters) {
    let node = document.createElement(obj.tag);
    if (obj.text) {
        if (obj.text == '{index}') {
            node.textContent = index;
        }
    }
    if (obj.class) {
        for (let className of obj.class) {
            if (className) {
                node.classList.add(className);
            }
        }
    }
    if (obj.children) {
        obj.children.forEach(item => {
            let elem = makeRow(item, seats, index, letters);
            node.appendChild(elem);
        });
    }
    if (obj.repeat) {
        let limit = obj.repeat == 'seats' ? seats / 2 : obj.repeat;
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < limit; i++) {
            let elem = node.cloneNode(true);
            let spanNoSeat = elem.querySelector('.no-seat')
            if (elem.classList.contains('col-xs-5') && spanNoSeat && i == limit - 1) {
                replaceClasses(spanNoSeat, 'no-seat', 'seat-label')
                replaceClasses(elem.querySelector('.seat-label'), 'seat-label', 'no-seat');
            }
            fragment.appendChild(elem);
        }
        if (isShortRow(obj.repeat, limit)) {
            let elem = node.cloneNode(true);
            replaceClasses(elem.children[0], 'seat-label', 'no-seat')
            fragment.appendChild(elem);
        }
        node = fragment;
    }
    if (node.classList && node.classList.contains('row')) {
        let seatNames = node.querySelectorAll('.seat-label');
        if (letters) {
            seatNames.forEach((item, idx) => item.textContent = letters[idx]);
        } else {
            seatNames.forEach(item => item.parentElement.removeChild(item));
        }

    }
    return node;
}

function isShortRow(repeatLiteral, repeatNum) {
    return (repeatLiteral == 'seats' && repeatNum == 2);
}

function replaceClasses(elem, from, to) {
    elem.classList.remove(from);
    elem.classList.add(to);
    return elem;
}

function cleanElement(map) {
    let childs = map.children;
    Array.from(childs).forEach(item => map.removeChild(item))
        //console.log(childs);
}