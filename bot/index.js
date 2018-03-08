const VK = require("vk-io");

function InjBot (config) {
    _this = this;

    this.vk = new VK({
        call: "execute",
        token: config.access_token
    })
    // Commands array
    this.commands = [];
    this.utils = require("./utils");
    this.sets = config;
    // Примитивная база
    this.users = {};

    // shit
    this.api = (method, params) => _this.vk.api.call(method, params);

    _this.vk.api.users.get()
        .then(function (res) {
            _this.sets.id = res[0].id;
            return console.log(`[VK] new account ${res[0].first_name} ${res[0].last_name} | ${res[0].id}`);
        })
    
    this.start = function () {
        _this.vk.longpoll.start()
            .then(() => console.log(`[BOT] Longpoll has been started..`))
        
        _this.vk.longpoll.on("message", async function (message) {
            if(!message.text || ~message.flags.indexOf("outbox")) return;
            // Добавление нового юзера в "базу", если его нет
            if(!_this.users[message.user]) {
                _this.vk.api.users.get({
                    user_ids: message.user
                }).then(function (res) {
                    _this.users[message.user] = {
                        nick: res[0].first_name,
                        balance: 5000
                    }
                })
            }

            var cmd = _this.commands.find(e => e.pattern.test(message.text));
            if(!cmd) return;
            if(cmd.admin && !~config.admins.indexOf(message.user)) return;
            // Logs
            console.log(`[MSG] Message from ${message.user}` + (message.chat ? ' | Chat_id: ' + message.chat : '') + `, message: ${message.text.match(/.{0,36}/).join("")}`);
            // Args
            message.args = message.text.match(cmd.pattern) || [];
            // Append / apply
            message.body = "";
            message.append = (text) => message.body += text + '\n';
            message.apply = function (params = {}) {
                message.reply(message.body, params);
                message.body = "";
            }
            // Plain сообщение, т.е "Имя + текст"
            message.plain = async function (text, params = {}) {
                const res = await _this.vk.api.users.get({ 
                    user_id: message.user
                })

                return message.send(res[0].first_name + ', ' + text, params);
            }
            // Применение функции
            cmd.func(message, _this);
        })

        _this.vk.longpoll.on("chat.invite", function (action) {
            if(action.invite === _this.sets.id) return;
            _this.vk.api.users.get({
                user_ids: action.invite
            }).then(function (res) {
                return action.send(`Приветствую *id${action.invite} (${res[0].first_name}) в нашей крутой беседе`);
            })
        })

        _this.vk.longpoll.on("chat.kick", function (action) {
            if(action.invite === _this.sets.id) return;
            return action.send(`Пока :C`);
        })

        setInterval(async() => {
            _this.vk.api.friends.getRequests({})
            .then(res => {
                if(res.count == 0) return;
                res.items.map(x => { 
                    _this.vk.api.friends.add({ user_id: x })
                    .catch(() => { 
                        _this.vk.api.friends.delete({ user_id: x }) 
                    })
                });
            })
            _this.vk.api.friends.getRequests({out: 1})
            .then(res => {
                if(res.count == 0) return;
                res.items.map(x => { 
                    _this.vk.api.friends.delete({ user_id: x })
                })
            })
        }, 60000)
    }

    this.on = function (p,d,f,a = false) {
        _this.commands.push({
            "pattern": p,                   // Паттерн команды, например /^!test/i
            "description": d,               // Описание команды
            "func": f,                      // Функция команды
            "admin": a                      // Является ли команда администраторкой, по умолчанию false
        })
    }
}

module.exports = InjBot;