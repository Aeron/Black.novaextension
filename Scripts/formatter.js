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

    async getPromiseToFormat(editor) {
        if (!this.config.get("formatOnSave")) return;

        return new Promise((resolve, reject) => {
            this.format(editor, resolve, reject);
        });
    }

    async format(editor, resolve=null, reject=null) {
        if (editor.document.isEmpty) {
            if (resolve) resolve();
            return;
        }

        let process = await this.getProcess();

        if (!process) {
            if (reject) reject();
            return;
        }

        const textRange = new Range(0, editor.document.length);
        const content = editor.document.getTextInRange(textRange);
        const filePath = nova.workspace.relativizePath(editor.document.path);

        let outBuffer = [];
        let errBuffer = [];

        process.onStdout((output) => outBuffer.push(output));
        process.onStderr((error) => errBuffer.push(error));
        process.onDidExit((status) => {
            if (status === 0) {
                const formattedContent = outBuffer.join("");

                let result = editor.edit((edit) => {
                    if (formattedContent !== content) {
                        console.log("Formatting " + filePath);
                        edit.replace(textRange, formattedContent, InsertTextFormat.PlainText);
                    } else {
                        console.log("Nothing to format");
                    }
                });

                if (resolve) resolve(result);
            } else {
                console.error(errBuffer.join(""));
                if (reject) reject();
            }
        });

        console.log("Running " + process.command + " " + process.args.join(" "));

        process.start();

        let writer = process.stdin.getWriter();

        writer.ready.then(() => {
            writer.write(content);
            writer.close();
        });
    }
}

module.exports = Formatter;
