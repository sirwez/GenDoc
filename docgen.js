const fs = require('fs-extra');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Command } = require('commander');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("Erro: Chave da API (API_KEY) não encontrada no arquivo .env.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);

let BATCH_SIZE = 5; // Número de arquivos por lote (valor padrão)
let WAIT_TIME = 10000; // Tempo de espera entre os lotes em milissegundos (valor padrão)

async function readTarget(targetPath) {
    try {
        const stat = await fs.stat(targetPath);
        const files = stat.isDirectory() ? await readRepo(targetPath) : [targetPath];
        const docPath = stat.isDirectory()
            ? path.join(targetPath, 'DOCUMENTATION.md')
            : path.join(path.dirname(targetPath), 'DOCUMENTATION.md');
        return { files, docPath };
    } catch (error) {
        console.error('Erro ao ler o alvo:', error);
        return null;
    }
}

async function readRepo(repoPath) {
    const items = await fs.readdir(repoPath);
    const files = await Promise.all(items.map(async (item) => {
        const fullPath = path.join(repoPath, item);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory() && !item.startsWith('.')) {
            return readRepo(fullPath);
        } else if (stat.isFile()) {
            return fullPath;
        }
    }));
    return files.flat().filter(Boolean);
}

async function generateDocumentation(content, isSingleFile) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
        You are an experienced senior developer tasked with creating a comprehensive and detailed documentation for ${isSingleFile ? "a single file" : "a multi-file project"} within a software repository. The documentation should be exhaustive, covering every relevant detail that another developer or team might need to understand, maintain, or extend the codebase. The documentation should follow best practices in technical writing, ensuring clarity, precision, and accessibility.

        **Project Overview:**
        - Provide a high-level summary of the purpose and functionality of the ${isSingleFile ? "file" : "project"}.
        - Explain the context in which this ${isSingleFile ? "file" : "project"} would typically be used.
        - Identify the main technologies and frameworks utilized.
        - Highlight any design patterns or architectural principles followed.

        **File Information (for each file):**
        - File Name:
        - Full Path:
        - Programming Language(s) (if identifiable):
        - General Description:
          - What is the overall purpose of this file?
          - What specific problems does it solve, and how does it fit into the larger codebase?
        - Dependencies and External Modules:
          - List any external libraries or modules used, with a brief description of their purpose.
          - Include version information if applicable.

        **Code Structure and Flow:**
        - Provide a detailed outline of the code structure.
        - Break down the file into its main components (functions, classes, modules).
        - For each component, include:
          - Name and location in the code.
          - Detailed description of its purpose and functionality.
          - Input Parameters:
            - Name, Type, and Description for each parameter.
          - Return Values:
            - Type and Description of the return value.
          - Example Usage:
            - Provide code snippets demonstrating typical use cases.
          - Edge Cases:
            - Document any potential edge cases or unusual scenarios that the code is designed to handle.
          - Performance Considerations:
            - Discuss any known performance characteristics, including potential bottlenecks.
          - Error Handling:
            - Describe how errors are managed within the code.
            - Include examples of error messages and handling strategies.

        **In-depth Analysis:**
        - Complex Algorithms and Business Logic:
          - Provide a step-by-step explanation of any complex algorithms, including pseudo-code if necessary.
          - Discuss the rationale behind the algorithm choices.
          - Include diagrams or flowcharts if applicable.
        - Security Considerations:
          - Highlight any security measures implemented within the code.
          - Discuss potential vulnerabilities and how they are mitigated.
        - Testing Strategies:
          - Provide detailed information on how the code can be tested.
          - Include examples of unit tests, integration tests, and end-to-end tests where applicable.
          - Discuss any known limitations of the current test coverage.

        **Code Quality and Best Practices:**
        - Identify any coding standards or best practices followed.
        - Discuss any areas of the code that could be refactored or improved, with suggestions.
        - Comment on code readability, maintainability, and scalability.

        **Future Development and Maintenance:**
        - Suggest areas for future development or enhancement.
        - Provide guidance on how to extend or modify the existing codebase.
        - Document any known issues or technical debt, with recommendations for addressing them.

        **Source Code:**
        \`\`\`
        ${content}
        \`\`\`
    `;

    try {
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.7
            },
        });

        const result = await chat.sendMessage(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Erro ao gerar a documentação:', error);
        return null;
    }
}

async function processFilesInBatches(files, isSingleFile) {
    let allDocumentation = '';

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);

        const content = await Promise.all(batch.map(async (file) => {
            const fileContent = await fs.readFile(file, 'utf8');
            return `\n\n### Arquivo: ${file}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
        }));

        const documentation = await generateDocumentation(content.join(''), isSingleFile);
        if (documentation) {
            allDocumentation += documentation;
        }

        if (i + BATCH_SIZE < files.length) {
            console.log(`Aguardando ${WAIT_TIME / 1000} segundos antes de processar o próximo lote...`);
            await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
        }
    }

    return allDocumentation;
}

async function processTarget(targetPath) {
    try {
        const { files, docPath } = await readTarget(targetPath);

        if (!files || !docPath) {
            console.error('Erro ao ler o alvo ou definir o caminho da documentação.');
            return;
        }

        const isSingleFile = files.length === 1;
        const documentation = await processFilesInBatches(files, isSingleFile);

        if (documentation) {
            await fs.writeFile(docPath, documentation);
            console.log('Documentação gerada com sucesso:', docPath);
        }
    } catch (error) {
        console.error('Erro ao processar o alvo:', error);
    }
}

// Configuração da CLI com Commander
const program = new Command();

program
    .version('1.0.0')
    .description('CLI para geração de documentação de arquivos ou projetos usando a API do Google Generative AI');

program
    .option('-p, --path <targetPath>', 'Caminho do arquivo ou pasta alvo')
    .option('-b, --batch-size <number>', 'Número de arquivos por lote', '5')
    .option('-w, --wait-time <milliseconds>', 'Tempo de espera entre os lotes em milissegundos', '10000')
    .action((options) => {
        const targetPath = options.path;
        if (!targetPath) {
            console.error('Erro: O caminho do arquivo ou pasta alvo deve ser especificado usando a opção -p ou --path.');
            process.exit(1);
        }

        BATCH_SIZE = parseInt(options.batchSize, 10);
        WAIT_TIME = parseInt(options.waitTime, 10);

        processTarget(targetPath);
    });

program.parse(process.argv);
