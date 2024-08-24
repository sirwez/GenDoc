## DocGen: Gerador de Documentação com Google Gemini

Este guia detalhado explica como usar o script `docgen.js` para gerar documentação técnica com o Google Gemini.

### 1. Obtenção do Código-Fonte

Comece clonando o repositório do GenDoc:

```bash
git clone https://github.com/sirwez/GenDoc.git
```

Navegue até a pasta do projeto:

```bash
cd GenDoc
```

### 2. Configuração do Ambiente

#### 2.1 Chave de API do Google Gemini

1. Acesse o [Google Cloud Platform](https://aistudio.google.com/) e obtenha sua chave de API.
2. Crie um arquivo chamado `.env` na pasta raiz do projeto `GenDoc`.
3. Abra o arquivo `.env` e adicione a seguinte linha, substituindo `SuaAPIKeyAqui` pela sua chave de API:

```
API_KEY=SuaAPIKeyAqui
```

#### 2.2 Instalação das Dependências

Instale as bibliotecas necessárias utilizando o NPM:

```bash
npm install @google/generative-ai fs-extra path dotenv
```

### 3. Configuração do Caminho do Arquivo/Pasta Alvo

Abra o arquivo `docgen.js` com um editor de texto. 

Localize a linha que define a variável `targetPath`:

```javascript
const targetPath = 'C:\\caminho\\para\\seu\\arquivo.js'; 
```

Substitua `C:\\caminho\\para\\seu\\arquivo.js` pelo caminho completo do seu arquivo ou pasta de código-fonte. 

**Exemplos:**

- **Único arquivo:**
   ```javascript
   const targetPath = 'C:\\MeusProjetos\\projetoX\\index.js'; 
   ```
- **Pasta:**
   ```javascript
   const targetPath = 'C:\\MeusProjetos\\projetoY\\src';
   ```

**Observação:** Utilize barras invertidas (\\) ou barras normais (/) no caminho, dependendo do seu sistema operacional.

### 4. Execução do Script

No terminal, navegue até a pasta `GenDoc` e execute o script:

```bash
node docgen.js
```

### 5. Visualização da Documentação

Após a execução, um arquivo `DOCUMENTATION.md` será gerado no mesmo diretório do arquivo ou pasta alvo. Abra este arquivo com um editor de texto ou visualizador Markdown para ver a documentação gerada.

### Observações Adicionais

- Certifique-se de ter permissão de leitura para o arquivo/pasta alvo.
- A qualidade da documentação depende da qualidade do código-fonte e das instruções fornecidas ao Gemini.
- O tempo de processamento varia de acordo com o tamanho do código-fonte.
- Consulte a documentação do Google Gemini para obter informações detalhadas sobre o modelo e suas capacidades. 
