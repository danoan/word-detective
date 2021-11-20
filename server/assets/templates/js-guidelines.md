# Modern Javascript Guidelines
  1. Always declare your variables using let.
    1. You may want to know the subtle differences with var
  2. To declare a constant: const MY_CONST = 42;
  3. We have BigInt type in js: let my_bi = 123456789123456789n
  4. Double and single quotes are basically the same thing.
  5. We can use `` to embed variables on strings: `Hello ${name}!`
  6. Mathematical operations are safe (never return an error).
    1. We have infinity := 1/0
    2. Nan := Any invalid mathematical operation
  7. Conversions
    1. To number: Number(my_var)
      1. Number(null) := 0
      2. +"12" := Number("12")
    2. To string: String(my_var)
    3. To boolean: Boolean(my_var)
      1. !!"this is converted to Boolean"
  8. Exponentiation is supported: 2**3 = 8
  9. String plus a number is a string
  10. String [any other math operator] number is a number
  11. Chained assignment is supported
    1. a=b=c=2
  12. Comma operator
    1. Several commands in one line: a=2,b=3+2,c="oi"
  13. Strict equality
    1. "0" == false (true. javascript convert both to numbers and compare)
    2. "0" === false (false. different types comparison are false)
  14. Javascript OR
    1. Let A,B,C strings
    2. a = A | B | C | false
      a will have the value of the first variable that evaluates to true, or
      the value of the last one, in this case, false.
    3. a = "" | "dan" | "sam" | "Anonymous".
      a evaluates to "dan"
  15. Analagously, AND returns the first falsy value
  16. The first defined (not null and not undefined)
    1. a ?? b ?? c ?? "Anonymous"
  17. Labels
    1. my_label : { code ... break my_label ... }
    2. outer : for(...){ inner: for(...){ break outer;} }
  18. Switch executes strict equalities
  19. Functions
    1. If an argument is not set, the function executes anyway
    The argument takes the undefined type.
    2. You can set default values for arguments.
    3. Functions are values; and every value has a type
    4. The type of a function is a object.
    5. It has properties indeed.
      1. name: function name
      2. length: number of arguments.
    6. We can have custom properties!
      1. function my_f(){ my_f.n_calls=0; }
    7. We can create functions from strings
      1. let sum = new Function('a', 'b', 'return a + b');
  20. Function expressions
    1. let f = function(...){... return}
    2. let f = (a,b) => expression
    3. let f = () => expression
    4. let f = a => expression
    5. left f = (a,b) => {... return}
      1. Arrow functions do not have their own context object this.
         It borrows from where it was called.
      2. Arrow functions do not have the arguments variable.
  21. Objects
    1. let o = new Object();
    2. let o = {};
    3. let o = { key: value };
    4. o.newKey = newValue;
    5. o["newKey"]
    6. delete o.newKey;
    7. let fruit = "apple";
       let bag = {
         [fruit] : 5
       };
    8. let name = "daniel";
       let age = 20;
       let user = {
         name,
         age
       }; <==>
       let user = {
         name:name,
         age:age
       };
    9. key in my_obj
    10. for(key in obj)
    11. objects are always passed by reference
       1. Primitive types are always passed by value
    12. Object.assign(dest, [src1,src2,...])
       1. Copy properties of src1,src2... to dest object
       2. It returns the filled dest object
    13. Deep clone should be implemented
       1. You can use the loadash library
  22. Rest parameters
       1. function sumAll(a,b,...args){ let s=a+b; for(arg in args) s+=arg; return s;}
       2. spread: let arr = [1,2,3]; Math.max(...arr);
          1. let arr = [...arr1,...arr2];
       3. Alternative object clone
          1. let clone = {...obj};
  23. Closure
       1. function makeCounter(){
         let count=0;
         return function(){ return count++; };
       }
       let counter = makeCounter();
       alert(counter()); //0
       alert(counter()); //1
  24. var declared variables are not block scoped
       1. They are either function scoped or global
  25. Decorators
       1. It is simply a wrapper.
       2. Example: caching
       3. Use func.call to pass context (this)
       4. Decorator is an instance of function forwarding
       5. We could also use func.apply (it accepted a single array-like type as arguments)
  26. Method borrowing
       1. [].join.call( not_array_but_iterable_type_as_context )
  27. Bind a function to a context
       1. boundFunc = func.bind(context)
  28. This is evaluated at running time
       1. function test(){
            console.log(this);
          };

          user.my_test = test;
          user.my_test() // user

          admin.my_test = test;
          admin.my_test() //admin
        2. This is the object before the dot.

  29. We can use the keword debugger to create a breakpoint in the code
  30. Tests
    1. Mocha: BDD test framework
    2. Chai: Library with several assertions
    3. Sinon: Library to spy over functions
  31. Transpilers
    1. It solves the following problem:
    I'm using the most recent features of javascript,
    but my users may have outdated browsers.
    The transpilers trasnform code written in the
    most recent idiom in a old construct style.
  32. Polyfill
    1. In case you are using a very recent builtin
    function, you may need to provide the implementation
    yourself to avoid cases in which the user is in an
    outdated browser.
  33. for..in; for..of
    1. for..in is the generic version.
    It should be used to iterate through the
    properties of an object;
    2. for..of is a special version for
    numeric properties (or arrays)
      The for..of iterates through the keys
      of the object that are numbers and then
      return the values they point to.
    3. If working with arrays, prefer the
    for..of. It is optimized for that!
  34. We can manually set a value for length.
    1. let a = ['a','b','c']
       a.length = 1;
       This command sequence truncates the array
       print(a) // ['a'];
    2. a.length = 0 // clears the array
    3. let a = [];
       a[123] = 'banana';
       a.length // 124
    4. Array is not a type. Array is an instatiation
       of Object type. It's main characteristic is that
       it has numeric properties.
   35. Garbage collection
   36. Arrow functions have no this
    1. They borrow it from the context they are defined
       (outer context)
   37. new Promisse( function(resolve,reject){...} )
    1. .then( function(result),function(error) )
    2. .catch( function(error) )
    3. .finally( ("clean_up function"))
   38. .then( fn_res,fn_rej )
       ==>
       return new Promisse( fn_res,fn_rej )

