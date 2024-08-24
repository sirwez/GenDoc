const fs = require('fs-extra');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Acessa a chave da API a partir das variáveis de ambiente
const API_KEY = process.env.API_KEY;

// Verifica se a chave da API foi definida
if (!API_KEY) {
  console.error("Erro: Chave da API (API_KEY) não encontrada no arquivo .env.");
  process.exit(1); // Encerra o script com erro se a chave não for encontrada
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Função para ler o arquivo ou pasta especificado e retornar o caminho do arquivo de documentação
async function readTarget(targetPath) {
    const stat = await fs.stat(targetPath);
    let files = [];

    if (stat.isDirectory()) {
        files = await readRepo(targetPath);
    } else if (stat.isFile()) {
        files.push(targetPath);
    } else {
        console.error('Caminho inválido:', targetPath);
        return null; // Retorna null se o caminho for inválido
    }

    // Define o caminho do arquivo DOCUMENTATION.md 
    const docPath = stat.isDirectory()
        ? path.join(targetPath, 'DOCUMENTATION.md')
        : path.join(path.dirname(targetPath), 'DOCUMENTATION.md');

    return { files, docPath }; // Retorna os arquivos e o caminho da documentação
}

// Função para ler todos os arquivos do repositório (recursivamente)
async function readRepo(repoPath) {
    let files = [];
    const items = await fs.readdir(repoPath);

    for (const item of items) {
        const fullPath = path.join(repoPath, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory() && !item.startsWith('.')) {
            files = files.concat(await readRepo(fullPath));
        } else if (stat.isFile()) {
            files.push(fullPath);
        }
    }

    return files;
}

// Função para gerar a documentação usando a API do Gemini
async function generateDocumentation(content, isSingleFile) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Ajusta o prompt dependendo se é um arquivo único ou um projeto
    const prompt = isSingleFile ?
        `
  Você é um desenvolvedor experiente, analisando o código-fonte de um arquivo. 
  Gere uma documentação detalhada e bem estruturada para este arquivo, incluindo:

  **Informações Essenciais:**
  * Nome do arquivo:
  * Caminho completo: 
  * Linguagem de programação (se possível identificar):
  * Descrição geral do propósito e funcionalidade do arquivo.
  * Quaisquer dependências ou módulos externos utilizados.

  **Análise Detalhada do Código:**
  * Para cada função, classe, método ou estrutura relevante no arquivo, forneça:
      * Nome
      * Descrição da funcionalidade
      * Parâmetros de entrada (se houver) e seus tipos
      * Valor de retorno (se houver) e seu tipo
      * Exemplos de uso
  * Explique quaisquer algoritmos complexos ou lógica de negócios.
  * Documente os casos de uso pretendidos e quaisquer potenciais casos extremos.
  * Se aplicável, forneça exemplos de como testar o código.

  **Código-Fonte:**
  \`\`\`
  ${content}
  \`\`\`
` :
        `
  Você é um desenvolvedor experiente, analisando o código-fonte de um projeto com múltiplos arquivos. 
  Gere uma documentação detalhada e bem estruturada para cada arquivo, incluindo:

  **Para cada arquivo:**
  * Nome do arquivo:
  * Caminho completo: 
  * Linguagem de programação (se possível identificar):
  * Descrição geral do propósito e funcionalidade do arquivo.
  * Quaisquer dependências ou módulos externos utilizados.

  **Análise Detalhada do Código (Para cada arquivo):**
  * Para cada função, classe, método ou estrutura relevante, forneça:
      * Nome
      * Descrição da funcionalidade
      * Parâmetros de entrada (se houver) e seus tipos
      * Valor de retorno (se houver) e seu tipo
      * Exemplos de uso
  * Explique quaisquer algoritmos complexos ou lógica de negócios.
  * Documente os casos de uso pretendidos e quaisquer potenciais casos extremos.
  * Se aplicável, forneça exemplos de como testar o código.

  **Código-Fonte:**
  \`\`\`
  ${content}
  \`\`\`
`;

    try {
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 1874901544,
                temperature: 0.7
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        return text;

    } catch (error) {
        console.error('Erro ao gerar a documentação:', error);
        return null;
    }
}

// Função principal para processar o arquivo/pasta e gerar a documentação
async function processTarget(targetPath) {
    try {
        const { files, docPath } = await readTarget(targetPath); // Obtém arquivos e docPath

        if (!files || !docPath) {
            console.error('Erro ao ler o alvo ou definir o caminho da documentação.');
            return; // Sai da função se houver erro
        }

        let content = '';
        for (const file of files) {
            const fileContent = await fs.readFile(file, 'utf8');
            content += `\n\n### Arquivo: ${file}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
        }

        const isSingleFile = files.length === 1;
        const documentation = await generateDocumentation(content, isSingleFile);

        if (documentation) {
            await fs.writeFile(docPath, documentation);
            console.log('Documentação gerada com sucesso:', docPath);
        }
    } catch (error) {
        console.error('Erro ao processar o alvo:', error);
    }
}

// Caminho do arquivo ou pasta alvo (ajuste conforme necessário)
// const targetPath = 'C:\\Users\\Lenovo\\agendart-3.0\\app\\Http\\Controllers\\Debug'; // Exemplo: processa uma pasta
const targetPath = 'C:\\Users\\Lenovo\\agendart-3.0\\app\\Http\\Controllers\\Debug\\DevController.php'; // Exemplo: processa um arquivo

processTarget(targetPath);