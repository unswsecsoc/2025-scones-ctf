FROM python:3
WORKDIR /app
COPY /src .
RUN pip install --no-cache-dir Flask
EXPOSE 9999
CMD ["python", "server.py"]
# run with --read-only (?)