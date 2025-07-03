#include <stdio.h>
#include <stdlib.h>


char message[48];
char admin = 0;

__attribute__((naked)) void i_hate_docker() {
    __asm__(
        "pop %rdi;\n"
        "ret;\n"
    );
}

void setup() {
    if (admin) {
        perror("whats even the point?");
    }
    return;
}


void vuln() {
    char asdf[10];
    read(0, asdf, 100);
}

int main(void) {

    setup();
    int number;
    scanf(" %d", &number);

    // printf("buf: %s\n", buf);
    // printf("asdf: %s\n", asdf);

    if (number > 47) {
        exit(69);
    }

    
    read(0, message+number, 48-number);

    vuln();

    return 0;
}
