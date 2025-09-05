//en la línea 167 se cambia el número con el que gana, esta en 2048 pero se puede bajar
document.addEventListener('DOMContentLoaded', () => {  

  const matriz = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ];

  let movimientos = 0;
  let tiempo = 0;
  let timerInterval = null;

  const sumaTotalSpan = document.getElementById("sumaTotal");
  const movimientosSpan = document.getElementById("movimientos");
  const tiempoSpan = document.getElementById("tiempo");
  const menuReportes = document.getElementById("menuReportes");



  const celdas = document.querySelectorAll('.cuadro .celda');
  const btnJugar = document.querySelector('.button-play');
  const btnPausar = document.querySelector('.button-pause');
  const mensaje = document.getElementById("mensajeJuego");
  const btnReport = document.querySelector('.button-report');

  let pausado = false;   
  let juegoTerminado = false;
  let fichaActiva = null; 
  let intervaloActual = null;
  let goal= 128;
  let iniciado= false;


  function calcularSuma() {
  let suma = 0;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      suma += matriz[i][j];
    }
  }
  return suma;
}

// actualizar el panel
function actualizarReportes() {
  sumaTotalSpan.textContent = calcularSuma();
  movimientosSpan.textContent = movimientos;
  tiempoSpan.textContent = tiempo + "s";
}



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


function sumarLasDeArriba(j2) {
  let cambio = true;
  while (cambio) {
    cambio=false;
    for (let i = 3; i >= 0; i--) { 
      if (matriz[i][j2] === 0){
        continue;
      } 
      if (matriz[i+1][j2] == 0){
        matriz[i+1][j2]=matriz[i][j2];
        matriz[i][j2]=0;
        cambio = true;
      }
      else if (matriz[i+1][j2]==matriz[i][j2]) {
        matriz[i+1][j2] *= 2;
        matriz[i][j2] = 0;
        cambio = true;
      }
    }
  }
  actualizarVista();
}


  function crearNuevaPieza() {
    let col = Math.floor(Math.random() * 4);
    let opciones = [2, 4, 8];
    let valor = opciones[Math.floor(Math.random() * opciones.length)];
    for(let i = 0; i<4;i++){
          if (matriz[0][i] !== 0) {
      mensaje.textContent = "¡Juego Terminado!";
      mensaje.style.display = "block";
      juegoTerminado = true;
      return null; 
    }
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
        //revisa si ya ganó
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {
              if (matriz[i][j] === 2048){
                goal = true;
              }
            }  
        }  





      },1000);
    });
  }

  async function loopJuego() {
    while (!juegoTerminado) {
      if (pausado) { 
        await new Promise(res => setTimeout(res, 500)); 
        continue; 
      }
      if(goal== true){
        mensaje.textContent = "¡Juego Terminado!";
        mensaje.style.display = "block";
        juegoTerminado = true;
        return null;
      }
      
      let col = crearNuevaPieza();
      if (col === null) break; 
      await soltarPieza(col);  
    }
  }
  function reiniciarJuego(){
    // limpiar matriz
    for (let i=0; i<5; i++) {
      for (let j=0; j<4; j++) {
        matriz[i][j] = 0;
      }
    }
    // limpiar estados
    fichaActiva = null;
    pausado = false;
    juegoTerminado = false;
    tiempo = 0;
    movimientos = 0;

    // detener intervalos activos
    if (intervaloActual) {
      clearInterval(intervaloActual);
      intervaloActual = null;
    }

    // limpiar vista
    actualizarVista();
    actualizarReportes();

    
    mensaje.style.display = "none";

  
    btnPausar.textContent = "PAUSAR";
  }

  // Botón jugar
  btnJugar.addEventListener('click', () => {
    mensaje.style.display = "none";
    juegoTerminado = false;
    if (iniciado==true){
      reiniciarJuego();
    }
    loopJuego();
    iniciado=true;
    tiempo = 0;
    movimientos = 0;
    btnJugar.textContent = "REINICIAR";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!pausado && !juegoTerminado) {
        tiempo++;
        actualizarReportes();
      }
    },1000);
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

btnReport.addEventListener('click', () => {
  if (menuReportes.style.display === "none") {
    menuReportes.style.display = "block";
    actualizarReportes();
  } else {
    menuReportes.style.display = "none";
  }
});


  // Mover con flechas izquierda/derecha
  document.addEventListener('keydown', (e) => {
    if (!fichaActiva || pausado || juegoTerminado) return;
      if (["ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
      movimientos++;
      actualizarReportes();
      }
    let { fila, col } = fichaActiva;
    if (e.key === "ArrowDown" && fila < 4){
      // si está libre abajo
  if (matriz[fila+1][col] === 0) {
    matriz[fila+1][col] = matriz[fila][col];
    matriz[fila][col] = 0;
    fichaActiva.fila++; 
  }
      // unión con la izquierda
      else if (matriz[fila+1][col] === matriz[fila][col]) {       
        sumarLasDeArriba(col)
      }
    
    }
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
        sumarLasDeArriba(col-1)
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
        sumarLasDeArriba(col+1)
      }
    }

    actualizarVista();
  });

});

