// Подключение "ядра"
const Core = require("./bot/index");
// Создание нового экземпляра
const bot = new Core({
    access_token: "",   // Токен
    admins: [1]         // Айди администраторов
})
// Подключение лонгпулла
bot.start();
// Пример использования message.plain
bot.on(/^!test/i, "test -- команда для првоерки бота", function (message) {
    return message.plain(`я работаю`);
})
// Пример использования message.append
bot.on(/^!(?:online|онлайн)/i, "online -- покажет пользователей онлайн", function (message, {vk}) {
    vk.api.messages.getChatUsers({
        chat_id: message.chat,
        fields: "online"
    }).then(async function (response) {
        message.append(`Сейчас в чате:`);
        await response.map(e => {
            if(e.id === -152029297) return;
            if(e.online != 0) message.append(`*id${e.id} (${e.first_name.slice(0,1)}. ${e.last_name})`);
        })
        return message.apply({ attachment: "photo435378035_456252104" });
    })
})
// Пример использования message.args + создание админской команды
bot.on(/^!eval\s(.*)/i, "eval -- исполняет JS код", function (message, core) {
    let result = eval(message.args[1]);
    return message.reply (
        typeof result === "object" ? JSON.stringify(result, null, "&#4448;") : result.toString()
    )
}, true)
// Пример с использованием "utils"
bot.on(/^!шар\s(.*)/i, "шар <text> -- ответит <<да>> или <<нет>> на ваш вопрос", function (message, {utils}) {
    return message.plain ( utils.randomPick( ['да', 'нет'] ) )
})
// Пример как выводить все команды, без учета админских
bot.on(/^!help/i, "help -- вывод всех доступных команд", function (message, {commands}) {
    return message.plain(`список доступных команд:\n` +
        commands.filter(cmd => !cmd.admin).map(cmd => '!' + cmd.description).join("\n")
    )
})

/** Примеры как сделать модульного бота

    # Примитивный, плохой пример:
        const fs = require("fs");

        fs.readdirSync('./commands').filter(e => e.endsWith('.js')).map(e => {
            cmd = require(e);
            bot.on(cmd.pattern, cmd.description, cmd.func, cmd.admin)
        })

    # Вариант получше:
        const fs = require("fs");

        fs.readdirSync('./commands').filter(e => e.endsWith('.js')).map(e => {
            bot.commands.push(e);
        })

**/