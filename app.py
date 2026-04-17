import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import google.generativeai as genai
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)
CORS(app)

# CONFIGURAÇÃO DO GEMINI (Lendo do servidor com segurança)
CHAVE_API = os.environ.get("GEMINI_API_KEY") 
genai.configure(api_key=CHAVE_API)
modelo_gemini = genai.GenerativeModel("gemini-1.5-flash")

# DADOS DE TESTE (Depois você pode mudar para ler do CSV/Drive)
dados_mock = pd.DataFrame([
    {'idade': 25, 'renda': 3000, 'profissao_texto': 'Estudante', 'cat_target': 'Hatch', 'Marca': 'Volkswagen', 'Modelo_Geracao': 'Polo', 'Ano': 2022, 'FIPE': 'R$ 70.000,00', 'Imagem': 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800', 'Origem': 'Manual'},
    {'idade': 45, 'renda': 15000, 'profissao_texto': 'Médico', 'cat_target': 'SUV', 'Marca': 'Jeep', 'Modelo_Geracao': 'Compass', 'Ano': 2024, 'FIPE': 'R$ 180.000,00', 'Imagem': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 'Origem': 'Manual'},
    {'idade': 35, 'renda': 8000, 'profissao_texto': 'Engenheiro', 'cat_target': 'Sedan', 'Marca': 'Honda', 'Modelo_Geracao': 'Civic', 'Ano': 2023, 'FIPE': 'R$ 120.000,00', 'Imagem': 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800', 'Origem': 'Manual'}
])

# TREINAMENTO
preprocessor = ColumnTransformer([('num', StandardScaler(), ['idade', 'renda']), ('texto', TfidfVectorizer(), 'profissao_texto')])
X = dados_mock[['idade', 'renda', 'profissao_texto']]
y = dados_mock['cat_target']
X_processed = preprocessor.fit_transform(X)
if hasattr(X_processed, 'toarray'): X_processed = X_processed.toarray()
le_y = LabelEncoder()
y_encoded = le_y.fit_transform(y)
rf_model = RandomForestClassifier(random_state=42).fit(X_processed, y_encoded)

@app.route('/api/recomendar', methods=['POST'])
def recomendar_carro():
    dados_cliente = request.json
    idade = dados_cliente.get('idade', 30)
    renda = dados_cliente.get('renda', 5000)
    profissao = dados_cliente.get('profissao', 'Outros')

    cliente_raw = preprocessor.transform(pd.DataFrame([{'idade': idade, 'renda': renda, 'profissao_texto': profissao}]))
    if hasattr(cliente_raw, 'toarray'): cliente_raw = cliente_raw.toarray()
    
    pred_cat = le_y.inverse_transform([rf_model.predict(cliente_raw)[0]])[0]
    rec_filtrada = dados_mock[dados_mock['cat_target'] == pred_cat].copy()
    rec_filtrada['Peso_Prioridade'] = np.where(rec_filtrada['Origem'] == 'Manual', 0, 1)
    carro_ideal = rec_filtrada.sort_values(by='Peso_Prioridade').iloc[0]

    try:
        prompt = f"Venda um {carro_ideal['Marca']} {carro_ideal['Modelo_Geracao']} para um {profissao} de {idade} anos."
        pitch = modelo_gemini.generate_content(prompt).text
    except:
        pitch = "Veículo selecionado com prioridade pelo nosso estoque."

    return jsonify({
        "sucesso": True,
        "recomendacao": {
            "marca": carro_ideal['Marca'], "modelo": carro_ideal['Modelo_Geracao'],
            "ano": int(carro_ideal['Ano']), "preco_fipe": carro_ideal['FIPE'],
            "imagem": carro_ideal['Imagem'], "argumento_vendas": pitch.strip()
        }
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)