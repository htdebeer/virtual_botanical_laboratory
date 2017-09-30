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
import {View} from "./View.js";
import {Command} from "../interpretation/Command.js";
import {PropertyEditor} from "./PropertyEditor.js";

const createPropertyEditor = function(view, properties, definedProperties) {
    const propertyEditor = new PropertyEditor(properties, definedProperties, {
        header: "Properties",
        keyLabel: "Name",
        valueLabel: "Value",
        addLabel: "Add property"
    });

    view.element.appendChild(propertyEditor.element);
};

const createCommandPropertyEditor = function(view, commands, definedCommands) {
    const commandEditor = new PropertyEditor(commands, definedCommands, {
        header: "Commands",
        keyLabel: "Name",
        valueLabel: "Definition",
        addLabel: "Add command definition"
    });

    view.element.appendChild(commandEditor.element);
};


/**
 * View represents a tab in the LabView.
 *
 */
class InterpretationView extends View {

    constructor(elt, interpretation, interpretationConfig = {}, config = {}) {
        super(elt, "interpretation", config);

        const properties = interpretation.registeredProperties.map(name => {
            return {
                name: name,
                type: "text",
                default: ""
            };
        });

        createPropertyEditor(this, properties, interpretationConfig.config);
        
        const commands = Object.keys(interpretation.commands).map(command => {
            return {
                name: command,
                type: "textarea",
                default: ""
            };
        });
        
        const definedCommands = {};

        if (undefined !== interpretationConfig.commands) {
            Object.keys(interpretationConfig.commands).forEach(name => {
                const command = new Command(interpretationConfig.commands[name]);
                definedCommands[name] = command.toString();
            });
        }

        createCommandPropertyEditor(this, commands, definedCommands);
    }
}

export {
    InterpretationView
};

