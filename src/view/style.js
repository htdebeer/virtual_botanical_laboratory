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
/**
 * The CSS styling for the LabView
 */
export default `
.lab-view {
    font-size: 12pt;
    font-family: Helvetica, Arial, sans-serif;
}

.lab-view .tabs {
    position: relative;
    min-height: 200px;
    height: 600px;
    clear: both;
    margin: 1px;
    padding: 0;
    
    background: #F5F5F5;
    border: 1px solid dimgray;
}

.lab-view .tab {
    list-style: none;
    float: left;
    height: 100%;
}

.lab-view .tab.right {
    float: right;
}

.lab-view .tab > label {
    padding: 0px 10px 4px 10px;
    left: 1px;
}

.lab-view .tab > label:hover {
    background: #E5E5E5;
}

.lab-view .tab > input[type="radio"] {
    display: none;
}

.lab-view .tab .contents {
    position: absolute;
    top: 26px;
    left: 0;
    background: white;
    right: 0;
    bottom: 0;
    padding: 5px;
    padding-bottom: 10px;
    border-top: 1px solid dimgray;
    overflow: auto;
}

.lab-view .tab > input[type=radio]:checked ~ label {
    background: dimgray;
    color: white;
    border-bottom: 1px white;
    z-index: 2;
}

.lab-view .tab > input[type=radio]:checked ~ label ~ .contents {
    z-index: 1;
}

.lab-view .tab > .contents h1 {
    font-size: 16pt;
    margin-top: 10px;
}

.lab-view .tab > .contents h2 {
    font-size: 14pt;
}

.lab-view .tab .actions {
    margin: 0;
    padding: 0;
    position: sticky;
    left: 0px;
    top: 0px;
}

.lab-view .tab .actions li {
    list-style: none;
    float: left;
}

.lab-view .tab .actions button {
    padding: 0px;
    margin: 1px;
    color: black;
}

.lab-view .tab .actions .spacer {
    padding-left: 5px;
    color: transparent;
}

.lab-view .tab .contents .messages p {
    border: 1px solid dimgray;
    padding: 1ex;
    margin: 1ex;
}

.messages .error {
    border-color: crimson;
    background-color: lightsalmon;
}

.messages .info {
    border-color: slateblue;
    background-color: lavender;
}

.lab-view .lsystem {
    width: 100%;
    height: 90%;
}

.lab-view pre {
    clear: left;
    padding: 1ex;
    overflow-x: auto;
    background-color: #f9f9f9;
}

.lab-view [data-section="lsystem"] .editor {
    width: 100%;
    height: 83%;
    clear: left;
    padding-top: 1ex;
}

.lab-view [data-section="lsystem"] textarea {
    width: 99%;
    height: 100%;
}

.lab-view [data-section="interpretation"] .property-editor {
    clear: left;
    padding-top: 1ex;
}

.lab-view .interpretation-contents {
    overflow-y: auto;
    height: 83%;
    clear: left;
}

.lab-view .property-editor table {
    border-collapse: collapse;
}

.lab-view .property-editor th {
    text-align: left;
}

.lab-view .property-editor th, .lab-view .property-editor td {
    padding: 0.5ex;
}

.lab-view .property-editor td.value {
    width: 100%;
}

.lab-view .property-editor textarea {
    width: 100%;
}

`;
