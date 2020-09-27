# Black Nova Extension

It’s a stand-alone Nova extension to use [Black](https://github.com/psf/black),
the uncompromising Python code formatter.

## Requirements

Before using the extension, it’s necessary to install Black itself if you don’t have
one already.

Black can be installed simply by running `pip install black`.

## Configuration

The extension supports both global and workspace configurations.
A workspace configuration always overrides a global one.

### Options

There are three options available to configure: executable path, command arguments,
and format on save. By default, the executable path is `/usr/local/bin/black`, with no
additional arguments, and formatting on saving is on.

You could alter the executable path if Black installed in a different place
or if `/usr/bin/env` usage is desirable.

In the case of `/usr/bin/env`, it becomes the executable path, and `black` becomes
the first argument.

### pyproject.toml

Also, the extension respects `pyproject.toml` in a project directory. So, there’s no
need to specify the `--config` argument explicitly.
