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

const _function = new WeakMap();

class Command {
    constructor(...args) {
        let func;

        if (0 >= args.length) {
            // create an empty function; does do nothing
            func = function () {};
        } else if (1 === args.length) {
            // create with a function or a constant
            if ("function" === typeof args[0]) {
                func = args[0];
            } else {
                func = function () { return args[0]; };
            }
        } else if (2 === args.length) {
            // create with formal parameters and a function body in a string
            func = new Function(args[0], args[1]);
        } else {
            // ?
            throw new Error(`Expected at most 2 arguments, got ${args.length} instead.`);
        }

        _function.set(this, func);
    }

    /**
     * Execute this Command in this interpretation given the supplier
     * parameters
     *
     * @param {Interpretation} interpretation - the interpretation in which this command is executed
     * @param {Array} [parameters = []] - the parameters used in this Commmand
     */
    execute(interpretation, ...parameters) {
        _function.get(this).apply(interpretation, parameters);
    }
}

export {
    Command
}
