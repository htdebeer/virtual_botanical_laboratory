/*
 * Copyright 2017 Huub de Beer <huub@heerdebeer.org>
 *
 * This file is part of virtual_botanical_laboratory.
 *
 * virtual_botanical_laboratory is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * virtual_botanical_laboratory is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 * Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with virtual_botanical_laboratory.  If not, see
 * <http://www.gnu.org/licenses/>.
 * 
 */
import {Command} from "./Command.js";

const _commands = new WeakMap();
const _initialState = new WeakMap();
const _states = new WeakMap();

const renderTree = function (interpretation, moduleTree) {
    for (const item of moduleTree) {
        if (Array.isArray(item)) {
            interpretation.enter();
            renderTree(interpretation, item);
            interpretation.exit();
        } else {
            interpretation.execute(item.name, item.parameters);
        }
    }
};

/**
 * An Interpretation of a LSystem
 *
 * @property {Object} state - the current state of this Interpretation.
 */
class Interpretation {
    /**
     * Create a new instance of an LSystem Interpretation.
     * 
     * @param {RenderingContext|SVGElement} canvas - the canvas to draw on.
     * @param {Object} scope - the scope of this Interpretation.
     */
    constructor(initialState = {}) {
        _initialState.set(this, initialState);
        _states.set(this, []);
        _commands.set(this, {});
    }

    get state() {
        const states = _states.get(this);
        if (0 === states.length) {
            this.initialize();
        }

        return states[states.length - 1];
    }

    /**
     * A command function has the following signature:
     *
     * @callback commandFunction
     * @param {Number[]} [parameters = []] - a list of numerical parameters
     * you can use in the command;
     */

    /**
     * Execute a command with given parameters in the context of this
     * Interpretation.
     *
     * @param {String} name - the name of the command to execute.
     * @param {Array} [parameters = []] - an optional list of actual
     * parameters to apply when the command is executed.
     */
    execute(name, parameters = []) {
        const command = _commands.get(this)[name];

        if (undefined === command) {
            throw new Error(`This interpretation has no command '${name}' to execute.`);
        }

        if ("string" === typeof command) {
            this.execute(command, parameters);
        } else if (command instanceof Command) {
            command.execute(this, parameters);
        } else {
            throw new Error(`'${name}' is not an executable command in this interpretation.`);
        }
    }

    /**
     * Set a property of this Interpretation.
     *
     * @param {String} name - the name of the property.
     * @param {Object} value - the new value of the property.
     */
    setProperty(name, value) {
        this.state[name] = value;
    }

    /**
     * Get a property of this Interpretation. If no such property exists, or
     * if its value is undefined or null, return the defaultValue.
     *
     * @param {String} name - the name of the property.
     * @param {defaultValue} [defaultValue = 0] - the default value of this
     * property if no such property exists or its value is undefined or null.
     *
     * @returns {Object} the value of the property.
     */
    getProperty(name, defaultValue = 0) {
        const value = this.state[name]
        return (undefined === value || null === value) ? defaultValue : value;
    }


    /**
     * Set a command in this Interpretation.
     *
     * @param {String} name - the name of the command to set.
     * @param {Command} command - the command.
     */
    setCommand(name, command) {
        _commands.get(this)[name] = command;
    }

    /**
     * Alias a command.
     *
     * @param {String|String[]} aliasNames - a list of aliases for command.
     * @param {String} commandName - a command's name.
     */
    alias(aliasNames, commandName) {
        if (!Array.isArray(aliasNames)) {
            aliasNames = [aliasNames];
        }

        for(const alias of aliasNames) {
            _commands.get(this)[alias] = commandName;
        }
    }

    /**
     * Get a command in this Interpretation.
     *
     * @param {String} name - the name of the command to get.
     * @returns {Command|undefined}
     */
    getCommand(name) {
        const command = _commands.get(this)[name];

        if (command instanceof Command) {
            return command;
        } else if ("string" === typeof command) {
            return getCommand(command);
        } else {
            return undefined;
        };
    }

    /**
     * Initialize a new rendering of this interpretation.
     */
    initialize() {
        _states.set(this, [_initialState.get(this)]);
    }

    /**
     * Render a moduleTree given this Interpretation.
     *
     * @param {ModuleTree} moduleTree - the moduleTree to render on the
     * canvas.
     */
    render(moduleTree) {
        this.initialize();
        renderTree(this, moduleTree);
        this.finalize();
    }

    /**
     * Enter a sub tree.
     */
    enter() {
        const currentState = Object.assign({}, this.state);
        _states.get(this).push(currentState);
    }

    /**
     * Exit a sub tree.
     */
    exit() {
        _states.get(this).pop();
    }

    /**
     * Finalize a rendering of this interpretation.
     */
    finalize() {
    }
}

export {
    Interpretation
}
