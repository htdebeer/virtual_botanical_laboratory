A while back I was reading *Artificial life. A report from the frontier where
computers meet biology* [@Levy1992a]. In this book, Levy describes the
development of the scientific field of *artificial life* till the 1990s.
Although I think the book was less readable than his work *Hackers* [@Levy2010a], it was still an
interesting read. What piqued my interest most in Levy's book on artificial
life was the idea of generating plant-like structures by means of a rewriting
system known as an *[L-system](https://en.wikipedia.org/wiki/L-system)*.

In the notes to the Chapter *Artificial flora, artifical fauna, artificial
ecologies* I found a reference to a book called *The algorithmic beauty of
plants* [@Prusinkiewicz1990a]. Given its age, I had little hope in finding
this book. To my surprise, it is available
[on-line](http://algorithmicbotany.org/papers/abop/abop.pdf)! (Warning, this
is a 17Mb PDF; see <http://algorithmicbotany.org/papers/#abop> for smaller
versions.) 

I downloaded the book and started reading it. Chapter 1 is introductory
material introducing the L-system formalism, its extensions, and a way to
render these L-systems. The authors render the L-systems by interpreting it in
terms of [turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics).
Turtle graphics is quite a simple way of thinking about drawing things with a
computer: given a turtle holding a pen, tell the turtle where to move, to
rotate, and to push the pen to the paper or not.

Seeing the turtle interpretation, I tried to read [@Prusinkiewicz1990a] using
a [constructionist
approach](https://en.wikipedia.org/wiki/Constructionism_(learning_theory)) by
building the examples myself. After a couple of fun hours programming these
prototypes, I decided to write my own virtual botanical laboratory because I
assumed that the software described in *The algorithmic beauty of plants*
would not exist anymore. Later, when I had finished most of the engine of my
virtual botanical laboratory, I discovered that the group who put the book
on-line also have put their
[software](http://algorithmicbotany.org/virtual_laboratory/) on-line as well.

![How much fun: I generated an odd looking tree!](images/generated_tree.png)

Then again, building my own laboratory probably deepened my understanding of
the material I would not have reached by using the available software. Here I
present my own virtual botanical laboratory that I unoriginally named
`virtual_botanical_laboratory`. Feel free to use is to explore the book *The
algorithmic beauty of plants* yourself, use it to generate your own plant-like
shapes, or just have fun with it!

