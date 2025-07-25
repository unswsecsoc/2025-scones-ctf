function do_mathematics() {
    rounded_number = 0.81.toFixed(1);
    return rounded_number + 1;
}

module.exports = { output:  do_mathematics().toString()}