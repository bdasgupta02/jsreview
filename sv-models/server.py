from flask import Flask, request
from models.vulnerability import *
import json

app = Flask(__name__)

model_vuln = get_model_vuln()


@app.route('/ping', methods=['GET'])
def welcome():
    return "pong"


@app.route('/predict/vulnerability', methods=['POST'])
def ep_predict_vuln():
    try:
        data = request.json
        pred = predict_vuln(
            model_vuln,
            mccc=data['mccc'],
            loc=data['loc'],
            tlloc=data['tlloc'],
            tloc=data['tloc'],
            hor_d=data['hor_d'],
            hon_d=data['hon_d'],
            hon_t=data['hon_t'],
            hvoc=data['hvoc'],
            hdiff=data['hdiff'],
            cycl=data['cycl'],
        )
        pred = pred.item()
        return json.dumps({"pred": pred})
    except Exception as e:
        return {"error": e}


@app.route('/predict/bugs', methods=['POST'])
def predict_bugs():
    # data should be array of functions
    return "todo"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8020)
