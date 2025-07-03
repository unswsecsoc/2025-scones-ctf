#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int total = 0;
char *blinds[9] = {0};


void flag() {
    char buf[30];
    FILE *flag = fopen("flag", "r");

    if (!flag) {
        puts("no flag file found");
        exit(69);
    }

    fgets(buf, sizeof(buf), flag);

    puts("nah that would be too easy");
}

void menu() {

    puts("1. New Blind");
    puts("2. Change Blind");
    puts("3. View Blind");
    puts("4. Remove Blind");
    puts("5. Print Flag");

}


void create() {

    int idx = -1;
    for (int i = 0; i < 9; i++) {
        if (blinds[i] == NULL) {
            idx = i;
            break;
        }
    }

    if (idx == -1) {
        puts("Sorry we do not have any more blinds for you.");
        exit(69);
    }

    char *new_blind = malloc(0x30);

    if (!new_blind) {
        puts("Something went horribly wrong");
        exit(69);
    }
    puts("What would you like to name your blinds?");
    printf("\n>> ");
    getchar();
    read(0, new_blind, 0x30);


    blinds[idx] = new_blind;
    total += 1;
    puts("Congratulations on your new blinds");
}

void change() {
    puts("Which blinds would you like to change?");
    printf("\n>> ");

    int choice;
    scanf(" %d", &choice);

    if (choice < 0 || choice > 8) {
        puts("Stop being blind, those blinds don't even exist");
        exit(69);
    }

    if (!blinds[choice]) {
        puts("Stop being blind, there are no blinds in that position.");
        exit(69);
    }
    
    puts("And what would you like to change your blinds to?");
    printf("\n>> ");
    getchar();
    read(0, blinds[choice], 0x30);
    
    puts("Congratulations on your changing your blinds");
    puts("");
}

void view() {

    puts("Which blinds would you like to view?");
    printf("\n>> ");

    int choice;
    scanf(" %d", &choice);

    if (choice < 0 || choice > 8) {
        puts("Stop being blind, those blinds don't even exist");
        exit(69);
    }

    if (!blinds[choice]) {
        puts("Stop being blind, there are no blinds in that position.");
        exit(69);
    }


    char key[] = "SCONES";
    char *result = strstr(blinds[choice], key);

    if (result) {
        printf("Here are your blinds: ");
        puts(blinds[choice]);
    } else {
        puts("Unfortunately our blinds are completely opaque, you are now blind.");
        // exit(69);
    }

}

void delete() {
    puts("Which blinds would you like to delete?");
    printf("\n>> ");

    int choice;
    scanf(" %d", &choice);

    if (choice < 0 || choice > 8) {
        puts("Stop being blind, those blinds don't even exist");
        exit(69);
    }

    if (!blinds[choice]) {
        puts("Stop being blind, there are no blinds in that position.");
        exit(69);
    }

    free(blinds[choice]);
    puts("Those blinds no longer exists");
}


int main(void) {

    setvbuf(stdout, NULL, _IONBF, 0);

    while(1) {
        menu();
        
        printf("\n>> ");
        int choice;
        scanf(" %d", &choice);
    
        switch (choice)
        {
        case 1:
            create();
            break;
        case 2:
            change();
            break;   
        case 3:
            view();
            break;
        case 4:
            delete();
            break;
        case 5:
            flag();
            break;
        default:
            puts("I am sorry, we cannot accommodate your blinds option at this point in time. Goodbye!");
            exit(69);
        }
    }
}