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

const stringifyModuleTree = function (tree) {
    const converted = [];
    for (const node of tree) {
        if (node instanceof ModuleTree) {
            converted.push("[");
            converted.push(stringifyModuleTree(node));
            converted.push("]");
        } else {
            converted.push(node.stringify());
        }
    }
    return converted.join(" ");
};

const flatten = function (moduleTree) {
    let modules = [];
    for (const item of moduleTree) {
        if (item instanceof ModuleTree) {
            modules = modules.concat(flatten(item));
        } else {
            modules.push(item);
        }
    }
    return modules;
};

/**
 * A ModuleTree.
 */
class ModuleTree extends Array {
    /**
     * Create a new ModuleTree instance with an initial list of nodes, if any.
     *
     * @param {Module|ModuleTree} [nodes = []] - an initial list of nodes for
     * this new ModuleTree
     */
    constructor(nodes = []) {
        super();
        for (const node of nodes) {
            this.push(node);
        }
    }

    /**
     * Iterator yielding each module in this ModuleTree, via a breadth first
     * strategy for sub ModuleTrees.
     *
     * @yield {Module}
     */
    * eachModule() {
        for (const module of flatten(this)) {
            yield module;
        }
    }

    /**
     * Create a String representation of this ModuleTree.
     *
     * @return {String}
     */
    stringify() {
        return stringifyModuleTree(this);
    }
}

export {
    ModuleTree
};
