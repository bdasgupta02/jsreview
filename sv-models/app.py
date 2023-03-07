from flask import Flask, request
from flask_cors import CORS
from models.vulnerability import *
from transformers import T5ForConditionalGeneration, RobertaTokenizer
from models.bugs import *
import json

app = Flask(__name__)
CORS(app, origins='*')

model_vuln = get_model_vuln()
model_bugs = T5ForConditionalGeneration.from_pretrained('bikpy/codet5-javascript-bug-refine')
token_bugs = RobertaTokenizer.from_pretrained('bikpy/codet5-javascript-bug-refine')

@app.route('/ping', methods=['GET'])
def ping():
    return "pong"


@app.route('/predict/multiple/vuln', methods=['POST'])
def ep_predict_vuln():
    try:
        data = request.json
        resp = []
        for func in data:
            #mccc, numpar, hor_d, hon_d, hon_t, hlen, hvoc, hdiff, params, cycl_dens
            pred = predict_vuln(
                model_vuln,
                mccc=func['mccc'],
                numpar=func['numpar'],
                hor_d=func['hor_d'],
                hon_d=func['hon_d'],
                hon_t=func['hon_t'],
                hlen=func['hlen'],
                hvoc=func['hvoc'],
                hdiff=func['hdiff'],
                params=func['params'],
                cycl_dens=func['cycl_dens'],
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
            resp.append(predict_bugs_func(func, model_bugs, token_bugs))
        return resp
    except Exception as e:
        return {"error": e}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8020)
