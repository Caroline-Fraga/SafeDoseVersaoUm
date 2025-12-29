# 🩺 SafeDose — Calculadora de Dosagem

Uma ferramenta educativa para cálculo de dosagens com foco em usabilidade, acessibilidade e boas práticas de front-end.


## Descrição 📘

SafeDose é uma calculadora de dosagem desenvolvida para fins educacionais e de portfólio. Implementada em HTML, CSS e JavaScript, a interface auxilia no cálculo da quantidade a administrar com base na dosagem prescrita e na concentração disponível do medicamento. O foco é clareza, responsividade, acessibilidade e boas práticas de front-end.

> ⚠️ Aviso: valores de segurança inclusos são exemplos. Este projeto NÃO substitui orientação clínica. Sempre consulte profissionais de saúde ou fontes validadas.

## Preview 👀

https://github.com/user-attachments/assets/7c84499a-891c-426b-9203-6f065319ca91

## Funcionalidades principais ✨

- 🧾 Formulário com campos: medicamento, dosagem prescrita, massa/volume da concentração e forma farmacêutica.
- ⚙️ Conversão de unidades (g ↔ mg ↔ mcg; L ↔ mL) e cálculo automático da quantidade a administrar.
- 🚨 Alerta de segurança com base em limites configuráveis para medicamentos.
- 🗂️ Histórico local via `localStorage` com remoção segura (modal de confirmação).
- ♿ Acessibilidade básica: `aria-live`, `aria-describedby`, foco visível e labels semânticos.
- 📱 Responsividade: suporte a desktop, tablet e mobile.

## Tecnologias 🛠️

- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)

- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)  (variáveis, Grid e Flexbox)

- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)  (ES6+)

- ![Font Awesome](https://img.shields.io/badge/Font%20Awesome-528DD7?style=flat&logo=fontawesome&logoColor=white)  (ícones)

## Como executar localmente 🏁

1. Clone o repositório:

```bash
git clone https://github.com/Caroline-Fraga/SafeDoseVersaoUm.git
cd SafeDoseVersaoUm
```

2. Inicie um servidor local (recomendado):

```bash
# Python 3
python -m http.server 3000

# Abra http://localhost:3000
```

3. Ou abra `index.html` diretamente no navegador.

4. Teste fluxos: preencher formulário, calcular e verificar histórico.


## Deploy 🚀

[![Vercel](https://img.shields.io/badge/Vercel-deploy-black)](https://safedoseversaoum.vercel.app/)


## Estrutura do projeto 📁

```
/
├─ index.html         # Interface principal
├─ style.css          # Estilos (variáveis, componentes, responsividade)
├─ script.js          # Lógica de cálculo, validação e histórico

```

## Acessibilidade (a11y) e UX ♿

- Campos configurados com `inputmode` e `aria-describedby` para melhorar suporte a leitores de tela.
- Painel de resultados com `aria-live` para anunciar mudanças dinâmicas.
- Foco visível para navegação por teclado.


## Segurança e boas práticas 🔒

- Evita `innerHTML` com dados do usuário; utiliza `textContent` e criação segura de elementos.
- Valida entradas numéricas e impede valores inválidos (≤ 0).
- Observação: lógica clínica deve ser validada por profissionais e, em produção, servida por backend confiável.


## Aprendizados e desafios 📚

- Tratamento de unidades e conversões com precisão.
- Balancear feedback visual (alerts) com acessibilidade.
- Garantir responsividade sem perder performance.


## Status ✅

![Status](https://img.shields.io/badge/status-Conclu%C3%ADdo-brightgreen)

---
## Autor ✍️

Desenvolvido por **Caroline Fraga da Silva**. Projetado para apresentação em portfólio e uso acadêmico.

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/caroline-fraga-da-silva/)
[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Caroline-Fraga)
