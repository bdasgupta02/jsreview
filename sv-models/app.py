from flask import Flask, request
from flask_cors import CORS
from models.vulnerability import *
from models.bugs import *
import json

app = Flask(__name__)
CORS(app)

model_vuln = get_model_vuln()

@app.route('/ping', methods=['GET'])
def ping():
    return "pong"


@app.route('/predict/multiple/vuln', methods=['POST'])
def ep_predict_vuln():
    try:
        data = request.json
        resp = []
        for func in data:
            pred = predict_vuln(
                model_vuln,
                mccc=func['mccc'],
                loc=func['loc'],
                tlloc=func['tlloc'],
                tloc=func['tloc'],
                hor_d=func['hor_d'],
                hon_d=func['hon_d'],
                hon_t=func['hon_t'],
                hvoc=func['hvoc'],
                hdiff=func['hdiff'],
                cycl=func['cycl'],
            )
            resp.append(pred.item())
        return json.dumps(resp)
    except Exception as e:
        return {"error": e}


@app.route('/predict/multiple/bugs', methods=['POST'])
def ep_predict_bugs():
    try:
        data = request.json
        resp = []
        for func in data:
            resp.append(predict_bugs_func(func))
        return resp
    except Exception as e:
        return {"error": e}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8020)
