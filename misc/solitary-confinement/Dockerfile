FROM nsjailcontainer

COPY ./src/. /solitary

EXPOSE 31337
CMD ["nsjail", "--config", "/solitary/nsjail.cfg", "--", "/solitary/startup.sh"]