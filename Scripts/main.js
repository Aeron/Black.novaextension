const Config = require("./Config");
const Formatter = require("./Formatter");

exports.activate = function () {
    const formatter = new Formatter(Config);

    console.info(`Executable path: ${Config.executablePath()}`);
    console.info(`Command arguments: ${Config.commandArguments()}`);
    console.info(`Format on save: ${Config.formatOnSave()}`);

    nova.workspace.onDidAddTextEditor((editor) => {
        if (editor.document.syntax !== "python") return;

        var event = null;

        Config.observe("formatOnSave", () => {
            if (event) event.dispose();

            if (Config.formatOnSave()) {
                event = editor.onWillSave(formatter.provideFormat, formatter);
            } else {
                event = null;
            }
        });
    });

    nova.commands.register("formatWithBlack", formatter.format, formatter);
    nova.commands.register(
        "formatWorkspaceWithBlack", formatter.formatWorkspace, formatter
    );
};
