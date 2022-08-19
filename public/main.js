
var socket = io.connect()
var username
const userbox = document.getElementById('users')
const userst = document.getElementById('userst')
const gamebox = document.getElementById('game-box')
const changer = document.getElementById('changer')
const secondbox = document.getElementById('second-box')
var currenttab = false
changer.innerText = 'Upgrades'
changer.style.zIndex = '0'
secondbox.style.display = 'none'
const ctext = document.getElementById('citizens')
const etext = document.getElementById('economics')
const news = document.getElementById('news')
const xp = document.getElementById('xp')
const sound = new Audio('imgs/worker_war.mp3')
sound.preload = 'auto'
const upgrades = {
    gems: document.getElementById('gems'),
    worker_steroids: document.getElementById('worker_steroids'),
    enchanted_cat: document.getElementById('enchanted_cat'),
    office_lean: document.getElementById('office_lean')   
}
const images = {
    hire: document.getElementById('hire'),
    buy_cat: document.getElementById('buy_cat'),
    destroy_building: document.getElementById('destroy_building'),
    lay_off: document.getElementById('lay_off'),
    money: document.getElementById('money')
}
const click = new Audio('imgs/money.mp3')
const mateusz = new Audio('imgs/mateusz/money.mp3')
const xptext = document.getElementById('xp-text')
var Themeatm = false

while (true){
    var u = prompt('Enter a username.')

    if (u !== "" && u !== null){
        username = u

        break
    }
}

function Tab(){
    if(currenttab){
        currenttab = false

        secondbox.style.display = 'none'
        gamebox.style.display = 'flex'
        changer.innerText = 'Upgrades'
    }else{
        currenttab = true

        secondbox.style.display = 'flex'
        gamebox.style.display = 'none'
        changer.innerText = 'Back'
    }
}

function Theme(){
    if(Themeatm){
        Themeatm = false

        images.buy_cat.src = 'imgs/buy_cat.png'
        images.hire.src = 'imgs/worker_add.png'
        images.lay_off.src = 'imgs/worker.png'
        images.destroy_building.src = 'imgs/destroy_building.png'
        images.money.src = 'imgs/cash.png'
    }else{
        Themeatm = true

        images.buy_cat.src = 'imgs/mateusz/buy_cat.png'
        images.hire.src = 'imgs/mateusz/worker_add.png'
        images.lay_off.src = 'imgs/mateusz/worker.png'
        images.destroy_building.src = 'imgs/mateusz/destroy_building.png'
        images.money.src = 'imgs/mateusz/cash.png'
    }
}

function Mine(){
    if(Themeatm){
        mateusz.play()
    }else{
        click.play()
    }
    socket.emit('mine')
}

function Upgrade(upgrade){
    socket.emit('upgrade', upgrade)
}

function Mayhem(data){
    socket.emit('mayhem', data)
}

function Hide(){
    if(userst.style.display == 'none'){
        userst.style.display = 'block'
        users.style.display = 'block'
    }else {
        userst.style.display = 'none'
        users.style.display = 'none'
    }
}

socket.emit('user-connection', username)

socket.on('message', (msg) => {
    if (msg == 'war'){
        sound.play()
        var bg = document.getElementById('htmlelement')
        bg.animate([
            { background: 'rgb(0,0,0)' },
            { background: 'rgb(100,0,0)' }
        ], 1500)

        setTimeout(() => {
            bg.style.background = 'rgb(0,0,0);'
        }, 1001)
    }else {
        alert(msg.message)
    }
})
const translate = {
    [false]: 'flex',
    [true]: 'none'
}

socket.on('updateglobal', (global) => {
    etext.innerText = `${global.economy} Money (global) | ${global.buildings} Buildings | ${global.income} Income per 10s`
    ctext.innerText = `${global.citizens} Citizens | ${global.workers} Workers`
    xptext.innerText = `${global.xp}/${global.maxxp} xp gained | Level ${global.level}`
    news.innerText = `NEWS FLASH: ${global.news}`
    for (up in global.upgrades) {
        const translation = translate[global.upgrades[up].bought]

        upgrades[up].style.display = translation
    }

    const calc = (global.xp / global.maxxp) * 100
    xp.style.width = `${calc}%`
})

socket.on('achievement', (data) => {
    console.log(data.title)
    console.log(data.description)
})

socket.on('user-connection', (data, global) => {
    etext.innerText = `${global.economy} Money (global) | ${global.buildings} Buildings | ${global.income} Income per 10s`
    ctext.innerText = `${global.citizens} Citizens | ${global.workers} Workers`
    xptext.innerText = `${global.xp}/${global.maxxp} xp gained | Level ${global.level}`
    news.innerText = `NEWS FLASH: ${global.news}`

    const calc = (global.xp / global.maxxp) * 100
    xp.style.width = `${calc}%`
    for (up in global.upgrades) {
        const translation = translate[global.upgrades[up].bought]
        
        upgrades[up].style.display = translation
    }
    
    while (userbox.firstChild) {
        userbox.removeChild(userbox.firstChild);
    };

    userbox.appendChild(document.createElement('br'))
    for (x in data) {
        element = data[x]

        if (element.left != true) {
            const li = document.createElement('li')
            li.innerText = `${element.username} (Caused ${element.mayhemcaused} acts of mayhem)`
            li.id = element.username
            userbox.appendChild(li)
            const br = document.createElement('br')
            userbox.appendChild(br)
        }
    };
})