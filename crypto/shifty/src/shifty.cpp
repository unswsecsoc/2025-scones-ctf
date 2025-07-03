#include <iostream>
#include <random>

uint64_t s;

int get_bit() {
    s ^= (s << 1) ^ (s >> 1);
    return s & 1;
}

int main() {

    std::random_device rd;
    std::mt19937_64 gen(rd());
    s = gen();
    uint64_t initial_s = s;

    std::cout << "How many bits?\n";
    int num;
    std::cin >> num;

    std::cout << "Here are your bits\n";
    for (int i = 0; i < num; i++) {
        std::cout << get_bit();
    }
    std::cout << "\n";

    std::cout << "Guess the initial state\n";
    uint64_t ans;
    std::cin >> ans;
    if (ans == initial_s) {
        std::cout << "*super secret flag*";
    } else {
        std::cout << "Sorry, try again!\n";
    }
}