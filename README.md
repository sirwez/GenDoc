## DocGen: Gerador de Documentação com Google Gemini

Este script Node.js utiliza o poder do Google Gemini para gerar documentação técnica detalhada de código-fonte, seja de um único arquivo ou de um projeto inteiro.

### Pré-requisitos:

- **Node.js e NPM:** Certifique-se de ter o Node.js e o NPM (Node Package Manager) instalados em seu sistema.
- **Chave de API do Google Gemini:** Obtenha sua chave de API no Google Cloud Platform e substitua  `'SUA_API_KEY'` no código pelo valor da sua chave. 
- **Biblioteca `@google/generative-ai`:** Instale a biblioteca usando o NPM:

  ```bash
  npm install @google/generative-ai fs-extra path
  ```

### Como usar:

1. **Salve o código:** Copie o código fornecido e salve-o em um arquivo chamado `docgen.js`.

2. **Defina o caminho alvo:** Altere a variável `targetPath` no final do código para o caminho do seu arquivo ou pasta de código-fonte. 
   - Para gerar documentação para um único arquivo:
     ```javascript
     const targetPath = 'C:\\caminho\\para\\seu\\arquivo.js'; 
     ```
   - Para gerar documentação para uma pasta (e seus subdiretórios):
     ```javascript
     const targetPath = 'C:\\caminho\\para\\sua\\pasta';
     ```

3. **Execute o script:** No terminal, navegue até o diretório onde você salvou `docgen.js` e execute o comando:

   ```bash
   node docgen.js
   ```

4. **Encontre a documentação:** O script irá gerar um arquivo `DOCUMENTATION.md` no mesmo diretório do arquivo ou pasta alvo.

### Funcionamento:

O script funciona da seguinte forma:

1. **Leitura do código-fonte:** 
   - Ele lê o arquivo ou pasta especificado em `targetPath`. 
   - Se for uma pasta, ele percorre recursivamente todos os arquivos dentro dela.
2. **Geração do prompt:** 
   - O script constrói um prompt para o Gemini, incluindo o código-fonte e instruções para gerar a documentação.
3. **Chamada à API do Gemini:** 
   - Ele envia o prompt para a API do Gemini, que utiliza um modelo de linguagem avançado para gerar a documentação.
4. **Escrita do arquivo Markdown:** 
   - O script recebe a documentação gerada pelo Gemini e a salva em um arquivo `DOCUMENTATION.md` no formato Markdown.

### Observações:

- O script foi projetado para funcionar com diferentes linguagens de programação.
- A qualidade da documentação gerada depende da qualidade do código-fonte e das instruções fornecidas no prompt.
- O limite de tokens para a API do Gemini pode ser ajustado na configuração `generationConfig`. 

### Exemplo de `DOCUMENTATION.md`:

O arquivo `DOCUMENTATION.md` gerado conterá a documentação em formato Markdown. A estrutura exata da documentação pode variar, mas incluirá informações como:

- Nome do arquivo
- Caminho completo
- Linguagem de programação
- Descrição da funcionalidade
- Detalhes de funções/classes/métodos, incluindo parâmetros, valores de retorno e exemplos de uso.


