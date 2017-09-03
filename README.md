# Virtual Botanical Laboratory

A while back I started reading [Prusinkiewicz and Lindenmayer (1990).The
Algorithmic Beauty of Plants](http://algorithmicbotany.org/papers/abop/abop.pdf)
(pdf). It uses countless examples and refers to "virtual botanical laboratory"
software for exploring these examples. Building on the theoretical ideas in
the first chapter, I wrote my own virtual botanical laboratory (VBL) as a way to
read the book in a constructionist way. 

The VBL runs in the web browser and renders LSystems to the HTMLCanvasElement.
In the examples sub directory I try to recreate each example in the book so
you can see it in your web browser, adapt some parameters, or experiment with
the underlying LSystem.

This is still very much a work in progress. I've divided the work into four
areas:

1. Creating a Lab class controlling a lsystem and its interpretation. This
   part has been completed to the extent that most examples from the first
   chapter of the Prusinkiewicz and Lindenmayer (1990) book can be run and
   intepreted.
2. Creating a LabView class to offer the user an interface to interact with
   the lab and the underlying LSystem and interpretation. I have not yet
   started with this part.
3. Documentation for using the Lab and LabView. Not started yet beyond this
   README.
4. Try to recreate all examples from the Prusinkiewicz and Lindenmayer (1990)
   book to allow easy exploration and sharing of the ideas in the book.

In no particular order, the
following tasks need still be done:

- Parts 2, 3, and 4.
- Allow 3D rendering
- Add importing LSystems
- Some advanced features explored in later chapters in the book.

## License 

GPLv3

## Examples

To run the examples, start a web server at the root of this project and
navigate to an example via a web browser. The npm package 'http-server' is
great for this task.

Note. Currently the examples use JavaScript modules. You need a modern web
browser with that functionality enabled.

With the version of 2017-08-17, I generated the following tree (based on
LSystem 1.40 (p. 50) of Prusinkiewucs and LindenMmayer (1990) The Algorithmic
Beauty of Plants):

![Generated tree](./generated_tree.png)

