document.addEventListener('DOMContentLoaded', () => {  

  const matriz = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ];

  const celdas = document.querySelectorAll('.cuadro .celda');
  const btnJugar = document.querySelector('.button-play');
  const btnPausar = document.querySelector('.button-pause');
  const mensaje = document.getElementById("mensajeJuego");

  let pausado = false;   
  let juegoTerminado = false;
  let fichaActiva = null; // { fila, columna }
  let intervaloActual = null;

  function actualizarVista(){
    for (let i=0; i<5; i++) {
      for (let j=0; j<4; j++) {
        let indiceCelda = i*4 + j;
        celdas[indiceCelda].textContent = matriz[i][j] === 0 ? "" : matriz[i][j];
        celdas[indiceCelda].setAttribute("data-valor", matriz[i][j]);
      }
    }
  }

  function moverPiezaAbajo(i,j){
    if(i<4 && matriz[i+1][j]==0){
      let temp = matriz[i][j];
      matriz[i][j] = 0;
      matriz[i+1][j] = temp;
      return true;
    }
    return false;
  }

  function sumarPiezas(i1,j1,i2,j2){
    matriz[i2][j2] *= 2;
    matriz[i1][j1] = 0;
    actualizarVista();
  }

  function crearNuevaPieza() {
    let col = Math.floor(Math.random() * 4);
    let opciones = [2, 4, 8];
    let valor = opciones[Math.floor(Math.random() * opciones.length)];

    if (matriz[0][col] !== 0) {
      mensaje.textContent = "¡Juego Terminado!";
      mensaje.style.display = "block";
      juegoTerminado = true;
      return null; 
    }

    matriz[0][col] = valor;
    fichaActiva = { fila: 0, col: col }; 
    actualizarVista();
    return col;
  }

  function soltarPieza(col) {
    return new Promise(resolve => {
      let fila_actual = 0;
      fichaActiva = { fila: fila_actual, col: col }; 

      intervaloActual = setInterval(() => {
        if (pausado) return; 
        if (!fichaActiva) return;

        let { fila, col } = fichaActiva;

        // si llegó al fondo
        if (fila === 4) { 
          fichaActiva = null;
          clearInterval(intervaloActual); 
          resolve();
        } 
        // si puede unirse con la pieza de abajo
        else if(matriz[fila+1][col] === matriz[fila][col]){ 
          sumarPiezas(fila,col,fila+1,col);
          fila++;
          fichaActiva = { fila, col };
        }
        // si hay bloqueo abajo
        else if(matriz[fila+1][col] !== 0){ 
          fichaActiva = null;
          clearInterval(intervaloActual); 
          resolve();
        }
        // sigue cayendo
        else{ 
          moverPiezaAbajo(fila, col);
          fila++;
          fichaActiva = { fila, col };
        }

        actualizarVista();
      },1000);
    });
  }

  async function loopJuego() {
    while (!juegoTerminado) {
      if (pausado) { 
        await new Promise(res => setTimeout(res, 500)); 
        continue; 
      }
      let col = crearNuevaPieza();
      if (col === null) break; 
      await soltarPieza(col);  
    }
  }

  // Botón jugar
  btnJugar.addEventListener('click', () => {
    mensaje.style.display = "none";
    juegoTerminado = false;
    loopJuego();
  });

  // Botón pausar/reanudar
  btnPausar.addEventListener('click', () => {
    if (juegoTerminado) return; 

    pausado = !pausado;
    if (pausado) {
      mensaje.textContent = "¡Juego Pausado!";
      mensaje.style.display = "block";
      btnPausar.textContent = "REANUDAR";
    } else {
      mensaje.style.display = "none";
      btnPausar.textContent = "PAUSAR";
    }
  });

  // Mover con flechas izquierda/derecha
  document.addEventListener('keydown', (e) => {
    if (!fichaActiva || pausado || juegoTerminado) return;

    let { fila, col } = fichaActiva;

    if (e.key === "ArrowLeft" && col > 0) {
      // si está libre a la izquierda
      if (matriz[fila][col-1] === 0) {
        matriz[fila][col-1] = matriz[fila][col];
        matriz[fila][col] = 0;
        fichaActiva.col--;
      }
      // unión con la izquierda
      else if (matriz[fila][col-1] === matriz[fila][col]) {
        sumarPiezas(fila,col,fila,col-1);
        fichaActiva.col--;
      }
    }

    if (e.key === "ArrowRight" && col < 3) {
      // si está libre a la derecha
      if (matriz[fila][col+1] === 0) {
        matriz[fila][col+1] = matriz[fila][col];
        matriz[fila][col] = 0;
        fichaActiva.col++;
      }
      // unión con la derecha
      else if (matriz[fila][col+1] === matriz[fila][col]) {
        sumarPiezas(fila,col,fila,col+1);
        fichaActiva.col++;
      }
    }

    actualizarVista();
  });

});
