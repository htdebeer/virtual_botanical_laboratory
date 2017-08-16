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
import {Production} from "./Production.js";
import {Successor} from "./Successor.js";
import {Predecessor} from "./Predecessor.js";
import {ModuleApplication} from "./ModuleApplication.js";
import {NumericalExpression} from "./NumericalExpression.js";

/**
 * An IdentityProduction is a Production that maps a Module to itself. This is
 * used in an LSystem for all Modules in an Alphabet that do not have a
 * Production of their own. This allows to use more succinct LSystem
 * definitions.
 */
class IdentityProduction extends Production {
    /**
     * Create a new IdentityProduction instance.
     *
     * @param {Module} module - the module for which to create the
     * IdentityProduction.
     */
    constructor(module) {
        const expressions = [];
        if (module.isParameterized()) {
            for (const name of module.parameters) {
                expressions.push(new NumericalExpression(name, name));
            }
        }
        const moduleApplication = new ModuleApplication(module.name, module, expressions);

        super(new Predecessor(moduleApplication), new Successor([moduleApplication]));
    }
}

export {
    IdentityProduction
}
