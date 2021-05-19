const Config = require("./Config");
const Formatter = require("./Formatter");

exports.activate = function() {
    const config = new Config();
    const formatter = new Formatter(config);

    console.info("Executable path: " + config.get("executablePath"));
    console.info("Command arguments: " + config.get("commandArguments"));
    console.info("Format on save: " + config.get("formatOnSave"));

    nova.workspace.onDidAddTextEditor((editor) => {
        editor.onWillSave(formatter.getPromiseToFormat, formatter);
    });

    nova.commands.register("formatWithBlack", formatter.format, formatter);
};
