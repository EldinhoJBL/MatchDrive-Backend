import os, json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Caminho do arquivo onde os carros serão salvos para sempre no servidor
ARQUIVO_ESTOQUE = "estoque_permanente.json"

# Inicializa o arquivo se ele não existir
if not os.path.exists(ARQUIVO_ESTOQUE):
    with open(ARQUIVO_ESTOQUE, "w") as f:
        json.dump([], f)

# CONFIGURAÇÃO DO GEMINI
CHAVE_API = os.environ.get("GEMINI_API_KEY") 
genai.configure(api_key=CHAVE_API)
modelo_gemini = genai.GenerativeModel("gemini-1.5-flash")

def carregar_estoque():
    with open(ARQUIVO_ESTOQUE, "r") as f:
        return json.load(f)

def salvar_estoque(dados):
    with open(ARQUIVO_ESTOQUE, "w") as f:
        json.dump(dados, f, indent=4)

@app.route('/api/estoque', methods=['GET'])
def listar_estoque():
    return jsonify(carregar_estoque())

@app.route('/api/estoque', methods=['POST'])
def adicionar_veiculo():
    novo_carro = request.json
    estoque = carregar_estoque()
    # Adiciona um ID único se não tiver
    if 'id' not in novo_carro:
        novo_carro['id'] = len(estoque) + 1
    estoque.append(novo_carro)
    salvar_estoque(estoque)
    return jsonify({"mensagem": "Salvo com sucesso!", "estoque": estoque})

@app.route('/api/estoque/<int:veiculo_id>', methods=['DELETE'])
def remover_veiculo(veiculo_id):
    estoque = carregar_estoque()
    estoque = [c for c in estoque if c.get('id') != veiculo_id]
    salvar_estoque(estoque)
    return jsonify({"mensagem": "Removido!", "estoque": estoque})

@app.route('/api/recomendar', methods=['POST'])
def recomendar_carro():
    dados_cliente = request.json
    profissao = dados_cliente.get('profissao', 'Cliente')
    estoque = carregar_estoque()
    
    if not estoque:
        return jsonify({"sucesso": False, "erro": "Estoque vazio"})

    # Para a demo, pegamos o primeiro do estoque ou um aleatório
    carro_ideal = estoque[0] 

    try:
        prompt = f"Crie um argumento de venda rápido para um {carro_ideal['marca']} {carro_ideal['modelo']} {carro_ideal['ano']} para um {profissao}."
        pitch = modelo_gemini.generate_content(prompt).text
    except:
        pitch = "O veículo perfeito para o seu perfil."

    return jsonify({
        "sucesso": True,
        "recomendacao": {
            **carro_ideal,
            "argumento_vendas": pitch.strip()
        }
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
