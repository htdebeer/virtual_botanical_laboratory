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
import {Interpretation} from "./Interpretation.js";

class TurtleInterpretation extends Interpretation {
    constructor(x = 0, y = 0, d = 0, delta = Math.PI/2, angle = 0) {
        super();
        this.addVariable("delta", delta);
        this.addVariable("d", d);
        this.addVariable("x", x);
        this.addVariable("y", y);
        this.addVariable("angle", angle);

        this.addCommand("+", function (canvas) {
            this.angle = this.angle + this.delta;
        })

        this.addCommand("-", function (canvas) {
            this.angle = this.angle - this.delta;
        });

        this.addCommand("f", function (canvas) {
            this.x = this.x + this.d * Math.cos(this.angle);
            this.y = this.y + this.d * Math.sin(this.angle);

            canvas.moveTo(this.x, this.y);
        });
        
        this.addCommand("F", function (canvas) {
            this.x = this.x + this.d * Math.cos(this.angle);
            this.y = this.y + this.d * Math.sin(this.angle);

            canvas.lineTo(this.x, this.y);
        });
    }

}

export {
    TurtleInterpretation
}
