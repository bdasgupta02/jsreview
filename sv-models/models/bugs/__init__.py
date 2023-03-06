import torch


def predict_bugs_func(func, model, tokenizer):
    # assumes the function is tokenized

    # cant exceed limits
    if len(tokenizer(func).input_ids) > 512:
        return func

    device = torch.device('cpu')
    model.eval()
    input_text = f'Refine: {func}'
    input_ids = tokenizer.encode(input_text, return_tensors='pt').to(device)
    generated = model.generate(input_ids, max_length=512)
    return tokenizer.decode(generated[0], skip_special_tokens=True)
