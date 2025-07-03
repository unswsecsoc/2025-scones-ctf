from flask import Flask, render_template, render_template_string, request
import os

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/search", methods=["GET"])
def search():
    data = request.args.get("query", "")
    filter = [".", "_", "import", "os", "system", "subprocess", "eval", "exec", "config", "open", "read", "write"]
    for word in filter:
        if word in data.lower():
            return render_template_string(f"Invalid query blocked, contains {word}")

    answer = f"results matching {data}: "
    with open("food.txt", "r") as file:
        for word in file.readlines():
            if data in word:
                answer += word + " "
    
    return render_template_string(answer)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9999)