Introduction
============

A while back I was reading *Artificial life. A report from the frontier where computers meet biology* (Levy 1992). In this book, Levy describes the development of the scientific field of *artificial life* till the 1990s. Although I think the book was less readable than his work *Hackers* (Levy 2010), it was still an interesting read. What piqued my interest most in Levy's book on artificial life was the idea of generating plant-like structures by means of a rewriting system known as an *[L-system](https://en.wikipedia.org/wiki/L-system)*.

In the notes to the Chapter *Artificial flora, artifical fauna, artificial ecologies* I found a reference to a book called *The algorithmic beauty of plants* (Prusinkiewicz and Lindenmayer 1990). Given its age, I had little hope in finding this book. To my surprise, it is available [on-line](http://algorithmicbotany.org/papers/abop/abop.pdf)! (Warning, this is a 17Mb PDF; see <http://algorithmicbotany.org/papers/#abop> for smaller versions.)

I downloaded the book and started reading it. Chapter 1 is introductory material introducing the L-system formalism, its extensions, and a way to render these L-systems. The authors render the L-systems by interpreting it in terms of [turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics). Turtle graphics is quite a simple way of thinking about drawing things with a computer: given a turtle holding a pen, tell the turtle where to move, to rotate, and to push the pen to the paper or not.

Seeing the turtle interpretation, I tried to read (Prusinkiewicz and Lindenmayer 1990) using a [constructionist approach](https://en.wikipedia.org/wiki/Constructionism_(learning_theory)) by building the examples myself. After a couple of fun hours programming these prototypes, I decided to write my own virtual botanical laboratory because I assumed that the software described in *The algorithmic beauty of plants* would not exist anymore. Later, when I had finished most of the engine of my virtual botanical laboratory, I discovered that the group who put the book on-line also have put their [software](http://algorithmicbotany.org/virtual_laboratory/) on-line as well.

![How much fun: I generated an odd looking tree!](images/generated_tree.png)

Then again, building my own laboratory probably deepened my understanding of the material I would not have reached by using the available software. Here I present my own virtual botanical laboratory that I unoriginally named `virtual_botanical_laboratory`. Feel free to use is to explore the book *The algorithmic beauty of plants* yourself, use it to generate your own plant-like shapes, or just have fun with it! (For example, look at that odd looking tree I generated above :-))

Running the `virtual_botanical_laboratory`
------------------------------------------

To run the `virtual_botanical_laboratory`, you need to:

-   include `dist/virtual_botanical_laboratory.js` in your HTML file. For example in the HEAD like:

    ``` html
    <!DOCTYPE html>
    <html>
        <head>
            <script src="dist/virtual_botanical_laboratory.js"></script>
    ```

-   create a LabView and configure it. For example:

    ``` html
    <figure id="lab"></figure>
    <script>
        new virtual_botanical_laboratory.LabView("#lab", {
            lsystem: `simple_tree = lsystem(
                description: "Simple growing tree",
                alphabet: {F, O, I, -, +},
                axiom: F I F I F I,
                productions: {
                    O < O > O -> I,
                    O < O > I -> I [ - F I F I ],
                    O < I > O -> I,
                    O < I > I -> I,
                    I < O > O -> O,
                    I < O > I -> I F I,
                    I < I > O -> I,
                    I < I > I -> O,
                    + -> -,
                    - -> +
                },
                ignore: {+, -, F}
            )`,
            interpretation: {
                config: {
                    x: 200,
                    y: 500,
                    width: 600,
                    height: 500,
                    d: 10,
                    delta: (-22.5 * Math.PI)/180,
                    alpha: (270 * Math.PI)/180,
                    close: false,
                    derivationLength: 24,
                    animate: false,
                    "line-width": 2,
                    "line-color": "#4E9C25"
                }
            }
        });
    </script>
    ```

-   and [open](https://heerdebeer.org/Software/virtual_botanical_laboratory/examples/example-labview.html) the HTML file in a modern web browser!

For more examples, please see the [examples](https://heerdebeer.org/Software/virtual_botanical_laboratory/#reading).

For more information about creating and configuring L-systems, see the chapters below. For more information about `virtual_botanical_laboratory`, I refer you to its [manual](https://heerdebeer.org/Software/virtual_botanical_laboratory/).

License
-------

`virtual_botanical_laboratory` is [free software](https://www.gnu.org/philosophy/free-sw.en.html); `virtual_botanical_laboratory` is released under the [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html). You find `virtual_botanical_laboratory`'s source code on [github](https://github.com/htdebeer/virtual_botanical_laboratory).

Developing `virtual_botanical_laboratory`
=========================================

Note. The `virtual_botanical_laboratory` is quite SPACE inefficient. This is fine for the prototype it is now, but this issue needs to be addressed when continuing the project.

If you plan on extending or adapting the `virtual_botanical_laboratory`, see the [API documentation](https://heerdebeer.org/Software/virtual_botanical_laboratory/documentation/api/).

Building
--------

-   To build the `virtual_botanical_laboratory`, run

    ``` bash
    npm install
    npm run build
    ```

-   To generate the API documentation, run

    ``` bash
    npm run doc
    ```

-   To generate the manual you need [pandocomatic](https://heerdebeer.org/Software/markdown/pandocomatic/) and [Bash](https://www.gnu.org/software/bash/), run

    ``` bash
    ./generate_documentation.sh
    ```

Todo
----

The `virtual_botanical_laboratory` is still a work in progress. With the current version you can explore much of the material in the book *The algorithmic beauty of plants* (Prusinkiewicz and Lindenmayer 1990). Some more advanced features from later in that book needs to be implemented still.

The following list of features and improvements are still to do:

-   **L-system language**:
    -   **Import**ing other l-systems
    -   **`&`** operator
    -   Other stuff from later in the book
    -   Derive a successor in a separate (worker) thread
-   **Interpretation**:
    -   Rendering **3D** interpretations
-   An **improved user interface**. The current interface is just a placeholder. Enough to configure and experiment with l-systems, but in not user-friendly. Feel free to replace it with something better, pull requests are welcome!

    -   make derivation and rendering cancellable.

References
==========

Levy, Steven. 1992. *Artificial Life. a Report from the Frontier Where Computers Meet Biology*. New York: Vintage books.

———. 2010. *Hackers*. Sebastopol: O’Reilly.

Prusinkiewicz, Prezemyslaw, and Aristid Lindenmayer. 1990. *The Algorithmic Beauty of Plants*. New York: Springer-Verlag. <http://algorithmicbotany.org/papers/#abop>.
