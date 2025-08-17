document.addEventListener("DOMContentLoaded", () => {
  const chatbot = document.querySelector(".chatbot");
  const closeBtn = document.querySelector(".close-btn");
  const openChatBtn = document.querySelector(".open-chat-btn");

  closeBtn.addEventListener("click", () => {
    chatbot.classList.add("hidden");
    openChatBtn.style.display = "block";
  });

  openChatBtn.addEventListener("click", () => {
    chatbot.classList.remove("hidden");
    openChatBtn.style.display = "none";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const tokenInput = document.getElementById("api-token");
  const submitTokenButton = document.getElementById("submit-token");

  if (tokenInput && submitTokenButton) {
    submitTokenButton.addEventListener("click", () => {
      const apiToken = tokenInput.value.trim();
      if (apiToken) {
        localStorage.setItem("apiToken", apiToken);
        window.location.href = "chat.html";
      } else {
        alert("Por favor, insira um token válido.");
      }
    });
  } else {
    const botaoFechar = document.querySelector(".close-btn");
    const caixaDeChat = document.querySelector(".chatbox");
    const entradaChat = document.querySelector(".chat-input textarea");
    const botaoEnviarChat = document.querySelector(".chat-input span");

    let mensagemUsuario = null;
    const CHAVE_API = localStorage.getItem("apiToken");
    const alturaInicialEntrada = entradaChat.scrollHeight;

    if (!CHAVE_API) {
      alert(
        "Token da API não encontrado. Redirecionando para a página inicial."
      );
      window.location.href = "index.html";
    }

    const formatarTexto = (texto) => {
      const codigoRegex = /```([\s\S]*?)```/g;
      const textoFormatado = texto.replace(codigoRegex, (match, p1) => {
        return `<pre><code>${p1.trim()}</code></pre>`;
      });
      return textoFormatado.replace(/\n/g, "<br>");
    };

    const criarElementoChat = (mensagem, classe) => {
      const chatLi = document.createElement("li");
      chatLi.classList.add("chat", `${classe}`);
      let conteudoChat =
        classe === "outgoing"
          ? `<p></p>`
          : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
      chatLi.innerHTML = conteudoChat;
      chatLi.querySelector("p").innerHTML = mensagem;
      return chatLi;
    };

    const aplicarEfeitoDigitacao = (elemento, texto, velocidade = 50) => {
      let index = 0;
      elemento.innerHTML = "";

      const digitarHTML = () => {
        if (index < texto.length) {
          let char = texto.charAt(index);
          if (char === "<") {
            const closingBracketIndex = texto.indexOf(">", index);
            if (closingBracketIndex !== -1) {
              elemento.innerHTML += texto.substring(
                index,
                closingBracketIndex + 1
              );
              index = closingBracketIndex;
            }
          } else {
            elemento.innerHTML += char;
          }
          index++;
          setTimeout(digitarHTML, velocidade);
        }
      };

      digitarHTML();
    };

    const gerarResposta = (elementoChat) => {
      const URL_API = "https://api.openai.com/v1/chat/completions";
      const elementoMensagem = elementoChat.querySelector("p");

      const opcoesRequisicao = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CHAVE_API}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: mensagemUsuario }],
        }),
      };

      fetch(URL_API, opcoesRequisicao)
        .then((res) => res.json())
        .then((data) => {
          const respostaFormatada = formatarTexto(
            data.choices[0].message.content.trim()
          );
          aplicarEfeitoDigitacao(elementoMensagem, respostaFormatada, 25);
        })
        .catch(() => {
          elementoMensagem.classList.add("error");
          elementoMensagem.textContent =
            "Ops! Algo deu errado. Por favor, tente novamente.";
        })
        .finally(() => caixaDeChat.scrollTo(0, caixaDeChat.scrollHeight));
    };

    const lidarComChat = () => {
      mensagemUsuario = entradaChat.value.trim();
      if (!mensagemUsuario) return;

      entradaChat.value = "";
      entradaChat.style.height = `${alturaInicialEntrada}px`;

      caixaDeChat.appendChild(criarElementoChat(mensagemUsuario, "outgoing"));
      caixaDeChat.scrollTo(0, caixaDeChat.scrollHeight);

      setTimeout(() => {
        const chatLiRecebido = criarElementoChat(
          '<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>',
          "incoming"
        );
        caixaDeChat.appendChild(chatLiRecebido);
        caixaDeChat.scrollTo(0, caixaDeChat.scrollHeight);
        gerarResposta(chatLiRecebido);
      }, 600);
    };

    entradaChat.addEventListener("input", () => {
      entradaChat.style.height = `${alturaInicialEntrada}px`;
      entradaChat.style.height = `${entradaChat.scrollHeight}px`;
    });

    entradaChat.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        lidarComChat();
      }
    });

    botaoEnviarChat.addEventListener("click", lidarComChat);
    botaoFechar.addEventListener("click", () =>
      document.body.classList.remove("show-chatbot")
    );
  }
});
