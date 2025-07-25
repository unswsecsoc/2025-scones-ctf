function fizzbuzz() {
    let finalString = "";
    for (let i = 1; i <= 100; i++) {
        if (i % 15 == 0) {
            finalString += "FizzBuzz\n";
        } else if (i % 3 == 0) {
            finalString += "Fizz\n";
        } else if (i % 5 == 0) {
            finalString += "Buzz\n";
        } else {
            finalString += i.toString() + "\n";
        }
    }

    return finalString;
}

module.exports =  { output : fizzbuzz() };