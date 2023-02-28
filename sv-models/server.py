from flask import Flask, request
from models.vulnerability import *

app = Flask(__name__)

model_vuln = get_model_vuln()


@app.route('/ping', methods=['GET'])
def welcome():
    return "pong"


@app.route('/predict/vulnerability', methods=['POST'])
def predict_vuln():
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
        return {"pred": pred}
    except:
        return {"error": "cannot predict"}


@app.route('/predict/bugs', methods=['POST'])
def predict_bugs():
    # data should be array of functions
    return "todo"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8020)
