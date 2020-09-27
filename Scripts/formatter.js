class Formatter {
    constructor(config) {
        this.config = config;
    }

    async getProcess() {
        const executablePath = this.config.get("executablePath");
        const commandArguments = this.config.get("commandArguments");
        const defaultOptions = ["--quiet", "-"];

        var options = [];

        if (commandArguments) {
            options = commandArguments
                .replaceAll("\n", " ")
                .split(" ")
                .map((option) => option.trim())
                .filter((option) => option !== " ");
        }

        options = [...options, ...defaultOptions].filter((option) => option !== "");

        return new Process(
            executablePath,
            {
                args: Array.from(new Set(options)),
                stdio: "pipe",
                cwd: nova.workspace.path,  // NOTE: must be explicitly set
            }
        );
    }

    async format(editor, onSave=false) {
        if (editor.document.isEmpty) return;

        const textRange = new Range(0, editor.document.length);
        const content = editor.document.getTextInRange(textRange);
        const filePath = nova.workspace.relativizePath(editor.document.path);

        let outBuffer = [];
        let errBuffer = [];

        const process = await this.getProcess();

        if (!process) return;

        process.onStdout((output) => outBuffer.push(output));
        process.onStderr((error) => errBuffer.push(error));
        process.onDidExit((status) => {
            if (status === 0) {
                const formattedContent = outBuffer.join("");

                editor.edit((edit) => {
                    if (formattedContent !== content) {
                        console.log("Formatting " + filePath);
                        edit.replace(textRange, formattedContent);
                    } else {
                        console.log("Nothing to format");
                    }
                });

                // NOTE: it's the only way to really-really save a file
                if (onSave) editor.save();
            } else {
                console.error(errBuffer.join(""));
            }
        });

        console.log("Running " + process.command + " " + process.args.join(" "));

        process.start();

        const writer = process.stdin.getWriter();

        writer.ready.then(() => {
            writer.write(content);
            writer.close();
        });
    }
}

module.exports = Formatter;
