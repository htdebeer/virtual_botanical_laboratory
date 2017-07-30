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
import {Module} from './Module.js';

/**
 * A ModuleDefinition defines a module in an alphabet.
 */
class ModuleDefinition extends Module {

    /**
     * Does an actual module matches this Module's definition?
     *
     * @param {Module} actualModule - the actual module to check against this
     * Module definition
     * @returns {Boolean} True if the number of parameters is the same in
     * actual and definition.
     */
    matchesDefinition(actualModule) {
        return this.parameters.length === actualModule.parameters.length;
    }

    /**
     * Create a String representation of this Module.
     *
     * @returns {String}
     */
    stringify() {
        if (this.isParameterized()) {
            return `${this.name}(${this.parameters.join(',')})`;
        } else {
            return this.name;
        }
    }
}

export {
    ModuleDefinition
}
