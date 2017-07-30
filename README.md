# Virtual Botanical Laboratory

A while back I started reading [Prusinkiewicz and Lindenmayer (1990).The
Algorithmic Beauty of Plants](algorithmicbotany.org/papers/abop/abop.pdf)
(pdf). It uses countless examples and refers to "virtual botanical laboratory"
software for exploring these examples. Building on the theoretical ideas in
the first chapter, I wrote my own virtual botanical laboratory (VBL) as a way to
read the book in a constructionist way. 

The VBL runs in the web browser and
renders LSystems to the HTMLCanvasElement. In the examples sub directory I try
to recreate each example in the book so you can see it in your web browser,
adapt some parameters, or experiment with the underlying LSystem.

This is still very much a work in progress. In no particular order, the
following tasks need still be done:

- re-create all examples for chapter 1 (and then read the rest of the book and
  recreate these examples as well)
- add a basic user interface to manipulate parameters and the lsystem
  definition
- add more automatic tests
- improve the API for the Interpretation objects
- write documentation

## License 

GPLv3

## Examples

To run the examples, start a web server at the root of this project and
navigate to an example via a web browser. The npm package 'http-server' is
great for this task.

Note. Currently the examples use JavaScript modules. You need a modern web
browser with that functionality enabled.

