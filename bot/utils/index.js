const Utils = {
    // Случайное число в промежутке
    random: (x,y) => y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x),
    // Случайный элемент из массива
    randomPick: (array) => array[Utils.random(array.length - 1)],
    // Примитивный фильтр
    filter: (text) => text.toString().replace(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig, ' <LINK REMOVED> '),
    // Склонение для "дней"
    nDay: (n, titles) => titles[(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)],
}

module.exports = Utils;