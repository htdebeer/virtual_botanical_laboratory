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
import {ModuleValue} from "./ModuleValue.js";
import {ModuleApplication} from "./ModuleApplication.js";
import {ModuleTree} from "./ModuleTree.js";


const applyParametersToModuleTree = function (moduleTree, parameters = {}) {
    const successor = new ModuleTree();
    for (const module of moduleTree) {
        if (module instanceof ModuleTree) {
            successor.push(applyParametersToModuleTree(module, parameters));
        } else {
            successor.push(module.apply(parameters));
        }
    }
    return successor;
};

/**
 * A successor in a production.
 *
 * @property {Module[]} a list of modules
 */
class Successor extends ModuleTree {
    /**
     * Apply parameters to this successor.
     * 
     * @param {Object[]} [parameters = {}] - the parameters to apply.
     *
     * @returns {Successor} This Successor with parameters applied, if any.
     */
    apply(parameters = {}) {
        return applyParametersToModuleTree(this, parameters);
    }
}

export {
    Successor

}
