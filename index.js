export function addon(command, msg) {
    console.log(`addon: ${command}`);
    msg.reply("hello world! from addon")
}
