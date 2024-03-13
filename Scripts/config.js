function get_config_value(key) {
    const _key = `${nova.extension.identifier}.${key}`;
    const global = nova.config.get(_key);
    let workspace = nova.workspace.config.get(_key);

    if (typeof global === "boolean" && typeof workspace == "number") {
        if (workspace === -1) workspace = null
        else workspace = Boolean(workspace)
    }

    if (workspace !== null && global !== workspace) return workspace;
    return global;
}

function observe_config_value(key, callback) {
    const fullKey = `${nova.extension.identifier}.${key}`;

    for (const config of [nova.config, nova.workspace.config]) {
        config.observe(fullKey, callback);
    }
}

// NOTE: we do not really need a class here
const Config = {
    observe: (key, callback) => observe_config_value(key, callback),
    executablePath: () => get_config_value("executablePath"),
    commandArguments: () => get_config_value("commandArguments"),
    formatOnSave: () => get_config_value("formatOnSave"),
}

module.exports = Config;
