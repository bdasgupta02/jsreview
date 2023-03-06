# import torch


# def predict_bugs_func(func, model, tokenizer):
#     # assumes the function is tokenized
#     device = torch.device('cpu')
#     model.eval()
#     input_text = f'Refine: {func}'
#     input_ids = tokenizer.encode(input_text, return_tensors='pt').to(device)
#     generated = model.generate(input_ids, max_length=512)
#     return tokenizer.decode(generated[0], skip_special_tokens=True)

import requests

API_URL = "https://api-inference.huggingface.co/models/bikpy/codet5-javascript-bug-refine"
headers = {"Authorization": "Bearer KEY"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

def predict_bugs_func(func):
    # assumes the function is tokenized
    o = query({"inputs": func})
    if len(o) > 0 and "generated_text" in o[0]:
        return o[0]['generated_text']
    else:
        return "error"
