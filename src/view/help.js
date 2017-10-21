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
 * The manual.
 */
export default `
<p>
<p>This is a short manual of how to use the <code>virtual_botanical_laboratory</code>. For more information see the <a href="https://heerdebeer.org/Software/virtual_botanical_laboratory/">website</a>.</p>
<h2 id="interface">Interface</h2>
<p>The <code>virtual_botanical_laboratory</code> has a very simple and bare-bones user interface. It has been added more as an afterthought than that it has been designed with user experience in mind. (Feel free to create a better interface, <code>virtual_botanical_laboratory</code> is free software after all.)</p>
<p>The interface is meant to show the generated images while giving the user access to the underlying L-system and the configuration of the interpretation of that L-system.</p>
<p>The user interface consists of five tab pages:</p>
<ol type="1">
<li><p>On the <em>main</em> tab page, labeled with <strong>♣</strong>, you can see the rendered L-system (see figure below). It also has some buttons to control the L-system and export the rendering.</p>
<figure>
<img src="https://heerdebeer.org/Software/virtual_botanical_laboratory/images/ui/main-tab.png" alt="The main tab to view and control the L-system" /><figcaption>The <em>main</em> tab to view and control the L-system</figcaption>
</figure>
<p>The following &quot;file&quot; actions are available:</p>
<ul>
<li><strong>★</strong> (New): create a new empty virtual botanical laboratory in a new window.</li>
<li><strong>▼ HTML</strong> (Export to HTML): export the virtual botanical laboratory to a HTML file. By default, this file is named after the L-system.</li>
<li><strong>▼ PNG</strong> (Export to PNG): export the rendered L-system to a PNG file. By default, this file is named after the L-system.</li>
</ul>
<p>The following &quot;control&quot; actions are available:</p>
<ul>
<li><strong>▶️</strong> (Run): derive new successors for the L-system until it has reached the derivation length set by property <code>derivationLength</code>. You can set that option on the <em>Interpretation</em> tab.</li>
<li><strong>⏸</strong> (Pause): stop deriving new successor.</li>
<li><strong>1</strong> (Step): derive the next successor for the L-system. Note. Due to the inefficiencies with respect to memory, this might crash your browser.</li>
<li><strong>⏮</strong> (Reset): reset the L-system to the axiom.</li>
</ul></li>
<li><p>You can view and edit the L-system definition on the <em>L-system</em> tab (see figure below).</p>
<figure>
<img src="https://heerdebeer.org/Software/virtual_botanical_laboratory/images/ui/lsystem-tab.png" alt="The L-system tab to view and change the L-system&#39;s definition" /><figcaption>The <em>L-system</em> tab to view and change the L-system's definition</figcaption>
</figure>
When you change the L-system, press the <strong>Update</strong> button to have the changes take effect. This will parse the L-system's definition. If you make an error, a warning is displayed. If everything is okay, a temporary information message to that effect is shown. Switch back to the <em>main</em> tab to see the changes in action.</li>
<li><p>You can view and change the configuration of the interpretation on the <em>Interpretation</em> tab (see figure below).</p>
<figure>
<img src="images/ui/https://heerdebeer.org/Software/virtual_botanical_laboratory/interpretation-tab.png" alt="The Interpretation tab to view and change the L-system&#39;s interpretation" /><figcaption>The <em>Interpretation</em> tab to view and change the L-system's interpretation</figcaption>
</figure>
<p>On this <em>Interpretation</em> tab, there are two sections:</p>
<ol type="1">
<li><p><strong>Properties</strong>, which is an editable list of properties you can set, update, or remove. These properties include:</p>
<ul>
<li>the <em>width</em> and <em>height</em> of the canvas</li>
<li>the start coordinates <em>x</em>, <em>y</em></li>
<li>the start angle <em>alpha</em></li>
<li>the distance to draw each <code>F</code> command, <em>d</em></li>
<li>the rotation to apply each <code>+</code> and <code>-</code> command, <em>delta</em></li>
<li>the <em>close</em> property to connect start and end points</li>
<li>the <em>derivationLength</em> property to set the number or derivation steps to perform</li>
<li>the <em>animate</em> property to indicate if each derivation step has to be shown or only the final result</li>
<li>the <em>line-width</em></li>
<li>the <em>line-color</em></li>
</ul></li>
<li><p><strong>Commands</strong>, which is a list of all commands defined in the L-system. You can edit their definitions. Note. the <code>this</code> refers to the <code>[Interpretation](https://heerdebeer.org/Software/virtual_botanical_laboratory/documentation/api/Interpretation.html)</code>.</p>
<p>The commands <code>F</code>, <code>f</code>, <code>+</code>, and <code>-</code> are defined by default. If you want to change their behavior, you have to introduce a new symbol in the L-system and write its command's code. You can call the default implementation as follows:</p>
<pre><code>this.getCommand(&quot;F&quot;).execute(this);</code></pre></li>
</ol></li>
<li>You can read a short manual on the <em>Help</em> tab (labeled <em>?</em>).</li>
<li><p>You can read about the <code>virtual_botanical_laboratory</code> and its license on the <em>About</em> tab (labeled <em>i</em>).</p></li>
</ol>
<h2 id="l-system">The L-system language</h2>
<p>The language to define a L-system follows the language described in the (first chapter of the) book <em>The algorithmic beauty of plants</em> <span class="citation" data-cites="Prusinkiewicz1990a">(Prusinkiewicz and Lindenmayer 1990)</span>. There are some notable differences:</p>
<ol type="1">
<li>Symbol names should be separated from each other. If you want to denote an <code>F</code> followed by another <code>F</code>, write <code>F F</code> rather than <code>FF</code>.</li>
<li>Symbols can have names of any length larger than 0. So you can use symbol <code>Forward</code> instead of <code>F</code> if you so please.</li>
<li>3D aspects of the language have not yet been implemented.</li>
<li>Language features described outside of Chapter 1 of <span class="citation" data-cites="Prusinkiewicz1990a">Prusinkiewicz and Lindenmayer (1990)</span> have not yet been implemented.</li>
</ol>
<p>Next the features of the L-system definition language are briefly introduced. For a more thorough overview, please see the <span class="citation" data-cites="Prusinkiewicz1990a">(Chapter on reading Prusinkiewicz and Lindenmayer 1990)</span>(#reading).</p>
<h3 id="basic-l-system-definitions">Basic L-system definitions</h3>
<p>A basic L-system is defined by three parts:</p>
<ol type="1">
<li>An <strong>alphabet</strong> with symbols, such as <code>F</code>, <code>-</code>, and <code>+</code>.</li>
<li>The <strong>axiom</strong> or the initial string of symbols, such as <code>F F</code>.</li>
<li>A list of rewriting rules called <strong>productions</strong>, such as <code>F -&gt; - F + F</code>.</li>
</ol>
<p>You specify the above L-system as follows:</p>
<pre class="lsystem"><code>my_first_lsystem = lsystem(
    alphabet: {F, -, +},
    axiom: F F,
    productions: {
        F -&gt; - F + F,
        - -&gt; -,
        + -&gt; +
    }
)</code></pre>
<p>Identity rewriting rules like <code>+ -&gt; +</code> can be omitted. If there is no rewriting rule specified for a symbol in the language, the identity rewriting rule is used by default.</p>
<p>For documenting purposes, you can also add a <strong>description</strong> to the L-system definition. So, the above example can be rewritten as:</p>
<pre class="lsystem"><code>my_first_lsystem = lsystem(
    description: &quot;This is my first L-system definition!&quot;,
    alphabet: {F, -, +},
    axiom: F F,
    productions: {
        F -&gt; - F + F
    }
)</code></pre>
<p>One of the interesting features of L-systems are branching structures. To define a sub structure, place it in between <code>[</code> and <code>]</code>. For example:</p>
<pre class="lsystem"><code>expanding_tree_circle = lsystem(
    alphabet: {F, -, +},
    axiom: F,
    productions: {
        F -&gt; F [ + F] - F
    }
)</code></pre>
<p>This will generate some expanding circle of branching lines.</p>
<h3 id="extensions-to-the-l-system-definition-language">Extensions to the L-system definition language</h3>
<ul>
<li><p>Stochastic L-systems. To bring some randomness into your generated plants, you can configure different successor patterns for one symbol and indicate the likelyhood these successor patterns are chosen by prepending each successor pattern with a numerical probability. The sum of these probabilities <strong>must</strong> be one (1).</p>
<p>For example, in the previous example you can choose circling left over right more often as follows:</p>
<pre class="lsystem"><code>expanding_random_tree_circle = lsystem(
    alphabet: {F, -, +},
    axiom: F,
    productions: {
        F: {
            0.4 -&gt; F [ + F] - F,
            0.6 -&gt; F [ - F] + F
        }
    }
)
</code></pre></li>
<li><p>Context-aware L-system. You can choose a different successor pattern depending on the context wherein a symbol appears. For example, a <code>F</code> after a <code>+</code> can be replaced by a <code>f + F</code>, and a <code>F</code> after a <code>-</code> can be replaced by a <code>F - f</code>. You can indicate which symbols should be ignored when checking the context using the <strong>ignore</strong> keyword. For example:</p>
<pre class="lsystem"><code>expanding_random_tree_circle = lsystem(
    alphabet: {F, f, -, +},
    axiom: f,
    productions: {
        - &lt; F -&gt; F - f,
        + &lt; F -&gt; f + F.
        f -&gt; f [ - F] f [+ f]
    },
    ignore: {f}
)
</code></pre>
<p>The <em>left context</em> is indicated by the string before the <code>&lt;</code> operator. You can indicate the <em>right context</em> by a string after the <code>&gt;</code> operator (not shown in the example).</p></li>
<li><p>Parameterized symbols. To move information through a derivation, you can user parameterized symbols. For example:</p>
<pre class="lsystem"><code>dx = 10;
ddx = 0.5;

expanding_random_tree_circle = lsystem(
    alphabet: {F&#39;(x), -, +},
    axiom: F&#39;(100),
    productions: {
        F&#39;(x): x &gt; 100 -&gt; F + [ F&#39;(x - dx) - F&#39;(x / ddx)],
        F&#39;(x): x &lt; 100 -&gt; F - [ F&#39;(x + dx) - F&#39;(x * ddx)]
    }
)
</code></pre>
<p>Here the <code>F'</code> symbol has parameter <code>x</code>. The successor to <code>F'(x)</code> differs depending on the value of <code>x</code>. These rewriting rules are <em>conditional</em>. You can define symbols with one or more parameters. Conditions can be complex by using Boolean operators <code>and</code>, <code>or</code>, and <code>not</code>.</p>
<p>Also note the definition of global values <code>dx</code> and <code>ddx</code>.</p>
<p>The power of parameterization is realized best by making using the parameter in the interpretation to change the behavior of the commands. For example, we can define the <code>F'</code> command as follows:</p>
<pre><code>this.d = this.d + x;
this.getCommand(&quot;F&quot;).execute(this);</code></pre></li>
</ul>
<h2 id="references" class="unnumbered">References</h2>
<div id="refs" class="references">
<div id="ref-Prusinkiewicz1990a">
<p>Prusinkiewicz, Prezemyslaw, and Aristid Lindenmayer. 1990. <em>The Algorithmic Beauty of Plants</em>. New York: Springer-Verlag. <a href="http://algorithmicbotany.org/papers/#abop" class="uri">http://algorithmicbotany.org/papers/#abop</a>.</p>
</div>
</div>
</p>
`;
