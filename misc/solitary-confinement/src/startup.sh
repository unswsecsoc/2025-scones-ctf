#! /bin/bash

cp -r /solitary/jail_template/. /jail/
chroot /jail /bin/bash --init-file /bin/cleanup.sh -i