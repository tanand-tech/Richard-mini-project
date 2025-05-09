"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTelegram = handleTelegram;
async function handleTelegram(f) {
    const text = f.message;
    switch (true) {
        case /\/help/.test(text):
            return help(f);
    }
}
function help(f) {
    return {
        chatId: f.chatId,
        method: 'sendMessage',
        options: { parse_mode: 'MarkdownV2' },
        message: `
*Commands*
    `,
    };
}
//# sourceMappingURL=handler.js.map