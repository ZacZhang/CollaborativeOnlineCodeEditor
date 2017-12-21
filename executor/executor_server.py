import json
import sys
from flask import Flask
from flask import request
from flask import jsonify
import executor_utils as eu

app = Flask(__name__)

@app.route("/build_and_run", methods=["POST"])
def build_and_run():
    print "Got called: %s" % (request.data)
    data = json.loads(request.data)

    if 'code' not in data or 'lang' not in data:
        return "You should provide both 'code' and 'lang'"

    code = data['code']
    lang = data['lang']

    print "API got called with code: %s in %s" % (code, lang)

    result = eu.build_and_run(code, lang)
    return jsonify(result)

if __name__ == "__main__":
    eu.load_image()

    port = int(sys.argv[1])
    print "Executor is running on: %d" % port
    app.run(port=port)
