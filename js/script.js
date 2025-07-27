     // Datos de ejemplo
      const examples = [
        {
          name: "Usuario amante de acción",
          inputs: [
            { name: "Género\nFavorito", value: 0.8, desc: "Acción (0.8)" },
            { name: "Rating\nPelícula", value: 0.9, desc: "4.5/5 estrellas" },
            { name: "Duración", value: 0.6, desc: "120 minutos" },
            { name: "Hora\nDía", value: 0.7, desc: "20:00 hrs" },
            { name: "Día\nSemana", value: 0.9, desc: "Viernes" },
          ],
          expected: 0.85,
        },
        {
          name: "Usuario casual",
          inputs: [
            { name: "Género\nFavorito", value: 0.3, desc: "Comedia (0.3)" },
            { name: "Rating\nPelícula", value: 0.6, desc: "3.0/5 estrellas" },
            { name: "Duración", value: 0.8, desc: "90 minutos" },
            { name: "Hora\nDía", value: 0.4, desc: "14:00 hrs" },
            { name: "Día\nSemana", value: 0.3, desc: "Martes" },
          ],
          expected: 0.45,
        },
        {
          name: "Usuario de fines de semana",
          inputs: [
            { name: "Género\nFavorito", value: 0.7, desc: "Drama (0.7)" },
            { name: "Rating\nPelícula", value: 0.8, desc: "4.0/5 estrellas" },
            { name: "Duración", value: 0.4, desc: "150 minutos" },
            { name: "Hora\nDía", value: 0.9, desc: "21:00 hrs" },
            { name: "Día\nSemana", value: 0.8, desc: "Sábado" },
          ],
          expected: 0.72,
        },
      ];

      let currentExample = 0;
      let isAnimating = false;

      // Estructura de la red
      const networkStructure = {
        inputs: 5,
        hidden1: 4,
        hidden2: 3,
        outputs: 1,
      };

      function createNetwork() {
        const container = document.getElementById("networkContainer");
        container.innerHTML = "";

        // Crear capas
        const inputLayer = createLayer(
          "Entradas",
          networkStructure.inputs,
          "input"
        );
        const hidden1Layer = createLayer(
          "Capa Oculta 1",
          networkStructure.hidden1,
          "hidden"
        );
        const hidden2Layer = createLayer(
          "Capa Oculta 2",
          networkStructure.hidden2,
          "hidden"
        );
        const outputLayer = createLayer(
          "Salida",
          networkStructure.outputs,
          "output"
        );

        container.appendChild(inputLayer);
        container.appendChild(hidden1Layer);
        container.appendChild(hidden2Layer);
        container.appendChild(outputLayer);

        // Crear conexiones
        setTimeout(() => {
          createConnections();
          updateInputValues();
        }, 100);
      }

      function createLayer(title, nodeCount, type) {
        const layer = document.createElement("div");
        layer.className = "layer";
        layer.dataset.type = type;

        const titleEl = document.createElement("div");
        titleEl.className = "layer-title";
        titleEl.textContent = title;
        layer.appendChild(titleEl);

        for (let i = 0; i < nodeCount; i++) {
          const node = document.createElement("div");
          node.className = `node ${type}-node`;
          node.dataset.layer = type;
          node.dataset.index = i;

          if (type === "input") {
            node.textContent = examples[currentExample].inputs[i].name;
            node.title = examples[currentExample].inputs[i].desc;
          } else if (type === "hidden") {
            node.textContent = `N${i + 1}`;
          } else {
            node.textContent = "Prob";
          }

          node.addEventListener("mouseenter", showTooltip);
          node.addEventListener("mouseleave", hideTooltip);

          layer.appendChild(node);
        }

        return layer;
      }

      function createConnections() {
        // Limpiar conexiones anteriores
        const existingConnections = document.querySelectorAll(".connection");
        existingConnections.forEach((conn) => conn.remove());

        const layers = document.querySelectorAll(".layer");

        for (let i = 0; i < layers.length - 1; i++) {
          const currentLayer = layers[i];
          const nextLayer = layers[i + 1];

          const currentNodes = currentLayer.querySelectorAll(".node");
          const nextNodes = nextLayer.querySelectorAll(".node");

          currentNodes.forEach((currentNode, currentIndex) => {
            nextNodes.forEach((nextNode, nextIndex) => {
              createConnection(
                currentNode,
                nextNode,
                currentIndex,
                nextIndex,
                i
              );
            });
          });
        }

        // Actualizar todas las posiciones múltiples veces para asegurar precisión
        setTimeout(() => updateAllConnectionPositions(), 50);
        setTimeout(() => updateAllConnectionPositions(), 150);
        setTimeout(() => updateAllConnectionPositions(), 300);
      }

      function updateAllConnectionPositions() {
        const connections = document.querySelectorAll(".connection");
        const layers = document.querySelectorAll(".layer");

        connections.forEach((connection) => {
          const layerIndex = parseInt(connection.dataset.layer);
          const fromIndex = parseInt(connection.dataset.fromNode);
          const toIndex = parseInt(connection.dataset.toNode);

          const currentLayer = layers[layerIndex];
          const nextLayer = layers[layerIndex + 1];

          if (currentLayer && nextLayer) {
            const fromNode = currentLayer.querySelectorAll(".node")[fromIndex];
            const toNode = nextLayer.querySelectorAll(".node")[toIndex];

            if (fromNode && toNode) {
              updateConnectionPosition(connection, fromNode, toNode);
            }
          }
        });
      }

      function createConnection(
        fromNode,
        toNode,
        fromIndex,
        toIndex,
        layerIndex
      ) {
        const connection = document.createElement("div");
        connection.className = "connection";

        // Usar getBoundingClientRect en el momento de la creación y actualizar después
        updateConnectionPosition(connection, fromNode, toNode);

        // Agregar peso
        const weight = document.createElement("div");
        weight.className = "weight";
        weight.textContent = (Math.random() * 2 - 1).toFixed(2);
        connection.appendChild(weight);

        connection.dataset.from = `${layerIndex}-${fromIndex}`;
        connection.dataset.to = `${layerIndex + 1}-${toIndex}`;
        connection.dataset.fromNode = fromIndex;
        connection.dataset.toNode = toIndex;
        connection.dataset.layer = layerIndex;

        document.getElementById("networkContainer").appendChild(connection);

        // Actualizar posición después de un breve delay para asegurar el renderizado
        setTimeout(
          () => updateConnectionPosition(connection, fromNode, toNode),
          50
        );
      }

      function updateConnectionPosition(connection, fromNode, toNode) {
        const containerRect = document
          .getElementById("networkContainer")
          .getBoundingClientRect();
        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();

        // Calcular posiciones relativas al contenedor de la red neuronal
        const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
        const x2 = toRect.left + toRect.width / 2 - containerRect.left;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top;

        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

        // Posicionar la línea desde el centro del nodo origen
        connection.style.left = x1 + "px";
        connection.style.top = y1 + "px";
        connection.style.width = length + "px";
        connection.style.transform = `rotate(${angle}deg)`;
        connection.style.transformOrigin = "0 50%";
      }

      function simulateForwardPass() {
        if (isAnimating) return;
        isAnimating = true;

        // Resetear todo
        resetAllAnimations();

        // Mostrar mensaje de inicio
        showProcessingMessage("🚀 Iniciando predicción...");

        setTimeout(() => {
          // Paso 1: Activar nodos de entrada
          activateInputNodes(() => {
            showProcessingMessage("🧠 Procesando capa oculta 1...");
            // Paso 2: Procesar primera capa oculta
            processLayer(0, 1, () => {
              showProcessingMessage("🔗 Procesando capa oculta 2...");
              // Paso 3: Procesar segunda capa oculta
              processLayer(1, 2, () => {
                showProcessingMessage("🎯 Calculando resultado final...");
                // Paso 4: Procesar salida
                processLayer(2, 3, () => {
                  setTimeout(() => {
                    showPrediction();
                    showProcessingMessage("✅ Predicción completada!");
                    setTimeout(() => {
                      hideProcessingMessage();
                      isAnimating = false;
                    }, 2000);
                  }, 1000);
                });
              });
            });
          });
        }, 1000);
      }

      function resetAllAnimations() {
        // Resetear conexiones
        document.querySelectorAll(".connection").forEach((conn) => {
          conn.classList.remove("active", "flowing");
          const weight = conn.querySelector(".weight");
          if (weight) weight.classList.remove("show");
        });

        // Resetear nodos
        document.querySelectorAll(".node").forEach((node) => {
          node.classList.remove("active", "processing");
          const activation = node.querySelector(".activation-value");
          if (activation) activation.classList.remove("show");
        });

        // Remover flujos de datos
        document
          .querySelectorAll(".data-flow")
          .forEach((flow) => flow.remove());

        document.getElementById("predictionResult").style.display = "none";
      }

      function activateInputNodes(callback) {
        const inputNodes = document.querySelectorAll(".input-node");
        let completed = 0;

        inputNodes.forEach((node, index) => {
          setTimeout(() => {
            node.classList.add("active", "processing");

            // Mostrar valor de activación
            showActivationValue(
              node,
              examples[currentExample].inputs[index].value
            );

            completed++;
            if (completed === inputNodes.length) {
              setTimeout(callback, 800);
            }
          }, index * 200);
        });
      }

      function processLayer(fromLayerIndex, toLayerIndex, callback) {
        const connections = document.querySelectorAll(
          `[data-from^="${fromLayerIndex}-"]`
        );
        const connectionsArray = Array.from(connections);
        let processedConnections = 0;

        // Agrupar conexiones por nodo de destino
        const connectionsByTarget = {};
        connectionsArray.forEach((conn) => {
          const target = conn.dataset.to;
          if (!connectionsByTarget[target]) {
            connectionsByTarget[target] = [];
          }
          connectionsByTarget[target].push(conn);
        });

        // Procesar cada grupo secuencialmente
        const targetNodes = Object.keys(connectionsByTarget);
        let processedTargets = 0;

        targetNodes.forEach((target, targetIndex) => {
          setTimeout(() => {
            const targetConnections = connectionsByTarget[target];
            let processedInGroup = 0;

            targetConnections.forEach((conn, connIndex) => {
              setTimeout(() => {
                // Activar conexión con efectos
                activateConnection(conn);

                processedInGroup++;
                if (processedInGroup === targetConnections.length) {
                  // Activar nodo objetivo cuando todas sus conexiones estén listas
                  setTimeout(() => {
                    activateTargetNode(target, toLayerIndex);
                    processedTargets++;

                    if (processedTargets === targetNodes.length) {
                      setTimeout(callback, 1000);
                    }
                  }, 300);
                }
              }, connIndex * 150);
            });
          }, targetIndex * 400);
        });
      }

      function activateConnection(connection) {
        // Mostrar peso con animación
        const weight = connection.querySelector(".weight");
        if (weight) {
          weight.classList.add("show");
        }

        // Activar conexión
        connection.classList.add("active");

        // Crear flujo de datos
        setTimeout(() => {
          connection.classList.add("flowing");
          createDataFlow(connection);
        }, 200);
      }

      function createDataFlow(connection) {
        const dataFlow = document.createElement("div");
        dataFlow.className = "data-flow";

        // Obtener la posición inicial de la conexión (desde el nodo origen)
        const startX = parseFloat(connection.style.left);
        const startY = parseFloat(connection.style.top);

        // Posicionar la partícula exactamente en el inicio de la conexión
        dataFlow.style.left = startX + "px";
        dataFlow.style.top = startY - 4 + "px"; // -4px para centrar la partícula en la línea
        dataFlow.style.position = "absolute";

        document.getElementById("networkContainer").appendChild(dataFlow);

        // Animar flujo de datos siguiendo exactamente la línea de conexión
        setTimeout(() => {
          dataFlow.classList.add("active");

          // Obtener la longitud y ángulo de la conexión
          const length = parseFloat(connection.style.width);
          const transformMatch = connection.style.transform.match(
            /rotate\(([-\d.]+)deg\)/
          );
          const angle = transformMatch ? parseFloat(transformMatch[1]) : 0;

          // Calcular el punto final usando trigonometría
          const endX = Math.cos((angle * Math.PI) / 180) * length;
          const endY = Math.sin((angle * Math.PI) / 180) * length;

          // Animar la partícula desde el inicio hasta el final de la conexión
          dataFlow.style.transition = "transform 0.8s ease-in-out";
          dataFlow.style.transform = `translate(${endX}px, ${endY}px)`;

          // Remover la partícula después de la animación
          setTimeout(() => {
            if (dataFlow.parentNode) {
              dataFlow.remove();
            }
          }, 900);
        }, 50);
      }

      function activateTargetNode(target, layerIndex) {
        const [layer, nodeIndex] = target.split("-");
        const targetNode = document.querySelector(
          `[data-layer][data-index="${nodeIndex}"]`
        );

        if (
          targetNode &&
          targetNode.closest(".layer").dataset.type !== "input"
        ) {
          targetNode.classList.add("active", "processing");

          // Calcular y mostrar valor de activación simulado
          const activationValue = Math.random() * 0.8 + 0.1; // Entre 0.1 y 0.9
          showActivationValue(targetNode, activationValue);
        }
      }

      function showActivationValue(node, value) {
        let activationEl = node.querySelector(".activation-value");
        if (!activationEl) {
          activationEl = document.createElement("div");
          activationEl.className = "activation-value";
          node.appendChild(activationEl);
        }

        activationEl.textContent = value.toFixed(2);
        activationEl.classList.add("show");
      }

      function showProcessingMessage(message) {
        let messageEl = document.getElementById("processingMessage");
        if (!messageEl) {
          messageEl = document.createElement("div");
          messageEl.id = "processingMessage";
          messageEl.style.cssText = `
                    position: absolute;
                    top: -60px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    color: #00ff88;
                    padding: 15px 25px;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 14px;
                    z-index: 1000;
                    border: 2px solid #00ff88;
                    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.3);
                    transition: all 0.4s ease;
                `;
          document.getElementById("networkContainer").appendChild(messageEl);
        }

        messageEl.textContent = message;
        messageEl.style.opacity = "1";
        messageEl.style.transform = "translateX(-50%) translateY(0)";
      }

      function hideProcessingMessage() {
        const messageEl = document.getElementById("processingMessage");
        if (messageEl) {
          messageEl.style.opacity = "0";
          messageEl.style.transform = "translateX(-50%) translateY(-20px)";
          setTimeout(() => {
            if (messageEl.parentNode) {
              messageEl.parentNode.removeChild(messageEl);
            }
          }, 400);
        }
      }

      function showPrediction() {
        const result = document.getElementById("predictionResult");
        const resultText = document.getElementById("resultText");

        const prediction = examples[currentExample].expected;
        const percentage = (prediction * 100).toFixed(1);

        let emoji, message, color;
        if (prediction > 0.7) {
          emoji = "✅";
          message = "MUY PROBABLE";
          color = "#4CAF50";
        } else if (prediction > 0.4) {
          emoji = "⚠️";
          message = "POSIBLE";
          color = "#FF9800";
        } else {
          emoji = "❌";
          message = "POCO PROBABLE";
          color = "#f44336";
        }

        resultText.innerHTML = `
                <div style="font-size: 3em; margin-bottom: 10px;">${emoji}</div>
                <div style="color: ${color}; font-weight: bold; margin-bottom: 10px;">${message}</div>
                <div>Probabilidad: ${percentage}%</div>
                <div style="font-size: 0.8em; margin-top: 10px; opacity: 0.8;">
                    ${examples[currentExample].name}
                </div>
            `;

        result.style.display = "block";
        result.style.borderColor = color;
        result.style.background = `rgba(${
          color === "#4CAF50"
            ? "76, 175, 80"
            : color === "#FF9800"
            ? "255, 152, 0"
            : "244, 67, 54"
        }, 0.2)`;
        
        // Mostrar botón de descarga después de mostrar el resultado
        setTimeout(() => {
          showDownloadButton();
        }, 1000);
      }

      function resetNetwork() {
        resetAllAnimations();
        hideProcessingMessage();
        isAnimating = false;

        // Restablecer valores de inputs a los valores iniciales
        const initialValues = {
          genero: 0.8,
          rating: 0.9,
          duracion: 0.6,
          hora: 0.7,
          dia: 0.9,
        };

        // Actualizar customInputs con valores iniciales
        customInputs = { ...initialValues };

        // Actualizar sliders y displays
        Object.keys(initialValues).forEach((key) => {
          const slider = document.getElementById(key);
          const valueDisplay = document.getElementById(key + "-value");
          if (slider && valueDisplay) {
            slider.value = initialValues[key];
            valueDisplay.textContent = initialValues[key].toFixed(1);
          }
        });

        // Limpiar mensajes de validación
        const validationMessages =
          document.getElementById("validationMessages");
        if (validationMessages) {
          validationMessages.classList.remove("show");
          validationMessages.innerHTML = "";
        }

        // Ocultar botón de descarga
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
          downloadBtn.style.display = 'none';
        }
        
        // Restablecer ejemplo actual y actualizar displays
        currentExample = 0; // Volver al primer ejemplo
        updateCurrentExample();
        updateDataCards();
        updateNetworkDisplay();
      }

      function changeExample() {
        currentExample = (currentExample + 1) % examples.length;
        resetNetwork();
        // Recrear completamente la red para asegurar posicionamiento correcto
        setTimeout(() => {
          createNetwork();
        }, 100);
      }

      function updateInputValues() {
        const inputNodes = document.querySelectorAll(".input-node");
        inputNodes.forEach((node, index) => {
          if (examples[currentExample].inputs[index]) {
            node.textContent = examples[currentExample].inputs[index].name;
            node.title = examples[currentExample].inputs[index].desc;
          }
        });
      }

      function showTooltip(event) {
        const node = event.target;
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";

        let content = "";
        if (node.dataset.layer === "input") {
          const index = parseInt(node.dataset.index);
          content = examples[currentExample].inputs[index].desc;
        } else if (node.dataset.layer === "hidden") {
          content =
            "Neurona que procesa y combina información de la capa anterior";
        } else {
          content = "Salida: Probabilidad de ver película completa (0.0 - 1.0)";
        }

        tooltip.textContent = content;
        tooltip.style.left = event.pageX + 10 + "px";
        tooltip.style.top = event.pageY - 30 + "px";

        document.body.appendChild(tooltip);
        node.dataset.tooltip = "active";
      }

      function hideTooltip(event) {
        const tooltips = document.querySelectorAll(".tooltip");
        tooltips.forEach((tooltip) => tooltip.remove());
        event.target.dataset.tooltip = "";
      }

      // Variables para controles interactivos
      let customInputs = {
        genero: 0.8,
        rating: 0.9,
        duracion: 0.6,
        hora: 0.7,
        dia: 0.9,
      };

      // Función para actualizar inputs
      function updateInput(inputName, value) {
        const numValue = parseFloat(value);
        customInputs[inputName] = numValue;

        // Actualizar display del valor
        document.getElementById(inputName + "-value").textContent =
          numValue.toFixed(1);

        // Validar entrada
        validateInput(inputName, numValue);

        // Actualizar ejemplo actual con valores personalizados
        updateCurrentExample();

        // Actualizar red neuronal
        updateNetworkDisplay();
      }

      // Función de validación
      function validateInput(inputName, value) {
        const validationMessages =
          document.getElementById("validationMessages");
        let messages = [];
        let hasErrors = false;

        // Validaciones específicas por input
        switch (inputName) {
          case "genero":
            if (value < 0.3) {
              messages.push({
                type: "warning",
                text: "⚠️ Género: Valor muy bajo, el usuario podría no estar interesado",
              });
            } else if (value > 0.8) {
              messages.push({
                type: "success",
                text: "✅ Género: Excelente coincidencia con preferencias",
              });
            }
            break;

          case "rating":
            if (value < 0.4) {
              messages.push({
                type: "error",
                text: "❌ Rating: Película con calificación muy baja",
              });
              hasErrors = true;
            } else if (value > 0.8) {
              messages.push({
                type: "success",
                text: "✅ Rating: Película muy bien calificada",
              });
            }
            break;

          case "duracion":
            if (value > 0.8) {
              messages.push({
                type: "warning",
                text: "⚠️ Duración: Película muy larga, podría afectar visualización completa",
              });
            } else if (value < 0.3) {
              messages.push({
                type: "success",
                text: "✅ Duración: Película corta, fácil de completar",
              });
            }
            break;

          case "hora":
            if (value < 0.2) {
              messages.push({
                type: "warning",
                text: "⚠️ Hora: Muy temprano, baja probabilidad de ver película completa",
              });
            } else if (value > 0.6 && value < 0.9) {
              messages.push({
                type: "success",
                text: "✅ Hora: Horario prime time, ideal para ver películas",
              });
            }
            break;

          case "dia":
            if (value > 0.7) {
              messages.push({
                type: "success",
                text: "✅ Día: Fin de semana, más tiempo disponible",
              });
            } else if (value < 0.3) {
              messages.push({
                type: "warning",
                text: "⚠️ Día: Día laboral, menos tiempo disponible",
              });
            }
            break;
        }

        // Mostrar mensajes de validación
        displayValidationMessages(messages);

        return !hasErrors;
      }

      // Mostrar mensajes de validación
      function displayValidationMessages(messages) {
        const container = document.getElementById("validationMessages");

        if (messages.length === 0) {
          container.classList.remove("show");
          return;
        }

        container.innerHTML = "";
        messages.forEach((msg) => {
          const div = document.createElement("div");
          div.className = `validation-${msg.type}`;
          div.textContent = msg.text;
          container.appendChild(div);
        });

        container.classList.add("show");
      }

      // Actualizar ejemplo actual con valores personalizados
      function updateCurrentExample() {
        const inputDescriptions = [
          { key: "genero", desc: getGenreDescription(customInputs.genero) },
          { key: "rating", desc: getRatingDescription(customInputs.rating) },
          {
            key: "duracion",
            desc: getDurationDescription(customInputs.duracion),
          },
          { key: "hora", desc: getTimeDescription(customInputs.hora) },
          { key: "dia", desc: getDayDescription(customInputs.dia) },
        ];

        // Actualizar el ejemplo actual
        examples[currentExample].inputs.forEach((input, index) => {
          const desc = inputDescriptions[index];
          input.value = customInputs[desc.key];
          input.desc = desc.desc;
        });

        // Calcular nueva predicción esperada basada en los inputs
        examples[currentExample].expected = calculatePrediction();
      }

      // Funciones para generar descripciones dinámicas
      function getGenreDescription(value) {
        if (value >= 0.8) return `Género favorito (${value.toFixed(1)})`;
        if (value >= 0.5) return `Género aceptable (${value.toFixed(1)})`;
        return `Género no preferido (${value.toFixed(1)})`;
      }

      function getRatingDescription(value) {
        const stars = (value * 5).toFixed(1);
        return `${stars}/5 estrellas`;
      }

      function getDurationDescription(value) {
        const minutes = Math.round(60 + value * 120); // 60-180 minutos
        return `${minutes} minutos`;
      }

      function getTimeDescription(value) {
        const hour = Math.round(6 + value * 18); // 6:00 - 24:00
        return `${hour}:00 hrs`;
      }

      function getDayDescription(value) {
        const days = [
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado",
          "Domingo",
        ];
        const dayIndex = Math.round(value * 6);
        return days[dayIndex];
      }

      // Calcular predicción basada en inputs actuales
      function calculatePrediction() {
        // Algoritmo simple de predicción basado en pesos
        const weights = {
          genero: 0.25,
          rating: 0.3,
          duracion: -0.15, // Negativo porque más duración = menos probabilidad
          hora: 0.2,
          dia: 0.2,
        };

        let prediction = 0;
        Object.keys(customInputs).forEach((key) => {
          prediction += customInputs[key] * weights[key];
        });

        // Normalizar entre 0 y 1
        prediction = Math.max(0, Math.min(1, prediction + 0.2)); // +0.2 como bias

        return prediction;
      }

      // Actualizar display de la red neuronal
      function updateNetworkDisplay() {
        updateInputValues();
        updateDataCards();
      }

      // Actualizar las tarjetas de datos
      function updateDataCards() {
        const dataCard = document.querySelector(".data-card ul");
        if (dataCard) {
          dataCard.innerHTML = `
            <li><strong>Género favorito:</strong> ${customInputs.genero.toFixed(
              1
            )} (${getGenreDescription(customInputs.genero)})</li>
            <li><strong>Rating película:</strong> ${customInputs.rating.toFixed(
              1
            )} (${getRatingDescription(customInputs.rating)})</li>
            <li><strong>Duración:</strong> ${customInputs.duracion.toFixed(
              1
            )} (${getDurationDescription(customInputs.duracion)})</li>
            <li><strong>Hora del día:</strong> ${customInputs.hora.toFixed(
              1
            )} (${getTimeDescription(customInputs.hora)})</li>
            <li><strong>Día semana:</strong> ${customInputs.dia.toFixed(
              1
            )} (${getDayDescription(customInputs.dia)})</li>
          `;
        }
      }

      // Función para generar valores aleatorios
      function randomizeInputs() {
        const inputs = ["genero", "rating", "duracion", "hora", "dia"];

        inputs.forEach((inputName) => {
          const randomValue = Math.random();
          const slider = document.getElementById(inputName);
          slider.value = randomValue.toFixed(1);
          updateInput(inputName, randomValue);
        });

        // Mostrar mensaje
        showProcessingMessage("🎲 Valores aleatorios generados!");
        setTimeout(() => hideProcessingMessage(), 2000);
      }

      // Inicializar controles
      function initializeControls() {
        // Sincronizar sliders con valores iniciales
        Object.keys(customInputs).forEach((key) => {
          const slider = document.getElementById(key);
          const valueDisplay = document.getElementById(key + "-value");
          if (slider && valueDisplay) {
            slider.value = customInputs[key];
            valueDisplay.textContent = customInputs[key].toFixed(1);
          }
        });

        // Actualizar ejemplo inicial
        updateCurrentExample();
        updateDataCards();
      }

      // Inicializar la red
      createNetwork();
      initializeControls();

      // Actualizar posiciones cuando la ventana cambie de tamaño
      window.addEventListener("resize", () => {
        setTimeout(() => {
          updateAllConnectionPositions();
        }, 100);
      });
 
    
  // Función para mostrar el botón de descarga después de la simulación
      function showDownloadButton() {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
          downloadBtn.style.display = 'block';
        }
      }

      // Función para generar y descargar el PDF
      async function downloadPDF() {
        try {
          // Mostrar mensaje de carga
          showProcessingMessage("📄 Generando PDF...");
          
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          // Configuración del PDF
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 20;
          let yPosition = margin;
          
          // Título del documento
          pdf.setFontSize(20);
          pdf.setTextColor(229, 9, 20);
          pdf.text('🎬 Red Neuronal Netflix - Reporte de Simulación', margin, yPosition);
          yPosition += 15;
          
          // Fecha y hora
          pdf.setFontSize(12);
          pdf.setTextColor(100, 100, 100);
          const now = new Date();
          pdf.text(`Generado el: ${now.toLocaleDateString()} a las ${now.toLocaleTimeString()}`, margin, yPosition);
          yPosition += 20;
          
          // Capturar la red neuronal
          const networkContainer = document.getElementById('networkContainer');
          if (networkContainer) {
            showProcessingMessage("📸 Capturando red neuronal...");
            
            const networkCanvas = await html2canvas(networkContainer, {
              backgroundColor: '#1a1a2e',
              scale: 2,
              useCORS: true
            });
            
            const networkImgData = networkCanvas.toDataURL('image/png');
            const networkImgWidth = pageWidth - (margin * 2);
            const networkImgHeight = (networkCanvas.height * networkImgWidth) / networkCanvas.width;
            
            // Verificar si necesitamos una nueva página
            if (yPosition + networkImgHeight > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.addImage(networkImgData, 'PNG', margin, yPosition, networkImgWidth, networkImgHeight);
            yPosition += networkImgHeight + 15;
          }
          
          // Resultado de la predicción
          const predictionResult = document.getElementById('predictionResult');
          if (predictionResult && predictionResult.style.display !== 'none') {
            showProcessingMessage("📊 Agregando resultado...");
            
            // Verificar si necesitamos una nueva página
            if (yPosition + 40 > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.setFontSize(16);
            pdf.setTextColor(229, 9, 20);
            pdf.text('Resultado de la Predicción:', margin, yPosition);
            yPosition += 10;
            
            const resultText = predictionResult.querySelector('#resultText');
            if (resultText) {
              const prediction = examples[currentExample].expected;
              const percentage = (prediction * 100).toFixed(1);
              
              let status, color;
              if (prediction > 0.7) {
                status = "MUY PROBABLE";
                color = [76, 175, 80];
              } else if (prediction > 0.4) {
                status = "POSIBLE";
                color = [255, 152, 0];
              } else {
                status = "POCO PROBABLE";
                color = [244, 67, 54];
              }
              
              pdf.setFontSize(14);
              pdf.setTextColor(color[0], color[1], color[2]);
              pdf.text(`Estado: ${status}`, margin, yPosition);
              yPosition += 8;
              
              pdf.setTextColor(0, 0, 0);
              pdf.text(`Probabilidad: ${percentage}%`, margin, yPosition);
              yPosition += 8;
              
              pdf.text(`Perfil: ${examples[currentExample].name}`, margin, yPosition);
              yPosition += 15;
            }
          }
          
          // Valores de entrada actuales
          showProcessingMessage("📋 Agregando parámetros...");
          
          // Verificar si necesitamos una nueva página
          if (yPosition + 80 > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFontSize(16);
          pdf.setTextColor(229, 9, 20);
          pdf.text('Parámetros de Entrada:', margin, yPosition);
          yPosition += 10;
          
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          
          const inputLabels = [
            'Género Favorito',
            'Rating Película',
            'Duración',
            'Hora del Día',
            'Día Semana'
          ];
          
          examples[currentExample].inputs.forEach((input, index) => {
            pdf.text(`• ${inputLabels[index]}: ${input.value.toFixed(1)} (${input.desc})`, margin, yPosition);
            yPosition += 6;
          });
          
          yPosition += 10;
          
          // Capturar la sección de fórmulas
          const formulaSection = document.querySelector('.formula-section');
          if (formulaSection) {
            showProcessingMessage("🧮 Capturando fórmulas...");
            
            // Verificar si necesitamos una nueva página
            if (yPosition + 100 > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            const formulaCanvas = await html2canvas(formulaSection, {
              backgroundColor: '#1a1a2e',
              scale: 1.5,
              useCORS: true
            });
            
            const formulaImgData = formulaCanvas.toDataURL('image/png');
            const formulaImgWidth = pageWidth - (margin * 2);
            const formulaImgHeight = (formulaCanvas.height * formulaImgWidth) / formulaCanvas.width;
            
            // Si la imagen es muy alta, dividirla en páginas
            if (formulaImgHeight > pageHeight - margin - yPosition) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.addImage(formulaImgData, 'PNG', margin, yPosition, formulaImgWidth, formulaImgHeight);
          }
          
          // Información adicional en la última página
          pdf.addPage();
          yPosition = margin;
          
          pdf.setFontSize(16);
          pdf.setTextColor(229, 9, 20);
          pdf.text('Información Adicional:', margin, yPosition);
          yPosition += 15;
          
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          
          const additionalInfo = [
            '¿Cómo funciona la Red Neuronal?',
            '',
            '1. Entradas: Datos del usuario y película (género preferido, rating,',
            '   duración, contexto temporal)',
            '',
            '2. Pesos: Valores aprendidos que determinan la importancia de cada',
            '   conexión entre neuronas',
            '',
            '3. Capas Ocultas: Procesan y combinan información para encontrar',
            '   patrones complejos en el comportamiento del usuario',
            '',
            '4. Salida: Probabilidad final de que el usuario vea la película',
            '   completa (valor entre 0.0 y 1.0)',
            '',
            'Arquitectura de la Red:',
            '• Capa de Entrada: 5 neuronas (features)',
            '• Primera Capa Oculta: 4 neuronas',
            '• Segunda Capa Oculta: 3 neuronas',
            '• Capa de Salida: 1 neurona (probabilidad)',
            '',
            'Función de Activación: Sigmoid σ(z) = 1 / (1 + e^-z)',
            '',
            'Este modelo es una simulación educativa que demuestra los',
            'conceptos básicos de las redes neuronales aplicadas a la',
            'predicción de comportamiento de usuarios en plataformas',
            'de streaming como Netflix.'
          ];
          
          additionalInfo.forEach(line => {
            if (yPosition > pageHeight - margin - 10) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 6;
          });
          
          // Pie de página
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Generado por Red Neuronal Netflix - Aprendamos Código', margin, pageHeight - 10);
          
          // Descargar el PDF
          showProcessingMessage("💾 Descargando PDF...");
          
          const fileName = `Red_Neuronal_Netflix_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}-${now.getMinutes().toString().padStart(2,'0')}.pdf`;
          pdf.save(fileName);
          
          showProcessingMessage("✅ PDF descargado exitosamente!");
          setTimeout(() => {
            hideProcessingMessage();
          }, 2000);
          
        } catch (error) {
          console.error('Error generando PDF:', error);
          showProcessingMessage("❌ Error al generar PDF");
          setTimeout(() => {
            hideProcessingMessage();
          }, 3000);
        }
      }