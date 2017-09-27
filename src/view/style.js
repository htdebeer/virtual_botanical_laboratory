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
export default `
.lab-view {
    font-size: 12pt;
}

.lab-view .tabs {
    position: relative;
    min-height: 200px;
    height: 600px;
    clear: both;
    margin: 1px;
    padding: 0;
    
    background: Chartreuse;
    border: 1px solid dimgray;
    padding-top: 10px;
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
    padding: 10px;
    left: 1px;
}

.lab-view .tab > label:hover {
    background: GreenYellow;
}

.lab-view .tab > input[type="radio"] {
    display: none;
}

.lab-view .tab .contents {
    position: absolute;
    top: 38px;
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

.lab-view .editor {
    width: 100%;
    height: 90%;
}
`;
