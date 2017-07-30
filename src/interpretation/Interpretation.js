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


const _scope = new WeakMap();
const _commands = new WeakMap();

/**
 * An Interpretation of a LSystem
 */
class Interpretation {
    /**
     * Create a new instance of an LSystem Interpretation.
     */
    constructor() {
        _commands.set(this, {});
        _scope.set(this, {});
    }

    /**
     * A command function has the following signature:
     *
     * @callback commandFunction
     * @param {RenderingContext} canvas - a canvas element to draw upon.
     * @param {Number[]} [parameters = []] - a list of numerical parameters
     * you can use in the command;
     */

    /**
     * Add a command to this Interpretation
     *
     * @param {String} name - the command's name
     * @param {commandFunction} func - the actual command
     */
    addCommand(name, func) {
        _commands.get(this)[name] = func;
    }

    /**
     * Get the command with 'name'.
     *
     * @param {String} name - the name of the command to get
     * @returns {commandFunction}
     */
    getCommand(name) {
        if (this.hasCommand(name)) {
            return _commands.get(this)[name];
        } else {
            return undefined;
        }
    }

    /**
     * Does this Interpretation have a command with 'name'?
     *
     * @param {String} name
     * @returns {Boolean} True if a command with this name has been added.
     */
    hasCommand(name) {
        return name in _commands.get(this);
    }

    /**
     * Add a global variable to this Interpretation
     *
     * @param {String} name - the variable's name
     * @param {Number} [value = 0] - the variable's value
     */
    addVariable(name, value= 0) {
        _scope.get(this)[name] = value;
    }

    /**
     * Get the value of the variable in this Interpretation.
     *
     * @param {String} name - the name of the variable
     * @returns {Number|undefined} The value of this variable if defined in
     * this Interpretation,
     * undefined otherwise
     */
    getVariable(name) {
        return _scope.get(this)[name];
    }

    /**
     * Does this Interpretation have 'name' defined as a variable?
     *
     * @param {String} name
     * @returns {Boolean} True if this Interpretation has a variable with
     * 'name'
     */
    hasVariable(name) {
        return name in _scope.get(this);
    }

    /**
     * Render a moduleTree given this Interpretation.
     *
     * @param {RenderingContext} canvas - the canvas to render the
     * interpretation of the moduleTree on.
     * @param {ModuleTree} moduleTree - the moduleTree to render on the
     * canvas.
     */
    render(canvas, moduleTree) {
        for (const module of moduleTree) {
            if (this.hasCommand(module.name)){
                const command = this.getCommand(module.name);
                command.apply(_scope.get(this), [canvas].concat(module.parameters));
            }
        }
    }
}

export {
    Interpretation
}
