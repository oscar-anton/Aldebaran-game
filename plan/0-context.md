# Contexto del proyecto

## Finalidad
Crear un videojuego pedagogico para ninas de 9 y 6 anos. El juego es un infinite runner sencillo en el que un personaje salta (con doble salto), recoge items y esquiva enemigos. Tras un tiempo aparece una casa (choza o cueva) donde se activa una prueba educativa.

## Variantes del juego (por curso)
- 1o primaria (6 anos):
  - Personaje: lince
  - Enemigo: serpiente
  - Item: diamante
  - Escenario: montana con pinos
  - Casa: cueva
  - Pruebas: completar palabras, sumas y restas
- 4o primaria (9 anos):
  - Personaje: mono
  - Enemigo: tigre
  - Item: platano
  - Escenario: jungla con palmeras y plataformas
  - Casa: choza
  - Pruebas: multiplicaciones, divisiones, preguntas de ciencias sociales, lengua o naturales

## Tecnologias
- React para el front.
- Phaser para el juego.
- Base desde template TypeScript: https://github.com/phaserjs/template-react-ts

## Assets actuales
- Personaje monkey
- Personaje linx
- Animacion monkey idle con su spritesheet
- Animacion linx idle con su spritesheet
- Plano de parallax de fondo clouds
- Segundo plano de parallax de fondo mountains

## Alcance inicial
- Base del proyecto con el template React + Phaser (TypeScript).
- Menu principal con dos opciones:
  - 1o primaria: personaje linx
  - 4o primaria: personaje monkey
- Mostrar parallax (clouds + mountains) y personajes en idle.

## Principios de implementacion
- Arquitectura por capas: UI (React) separada de escena de juego (Phaser).
- Configuracion parametrizable por variante (datos, no logica duplicada).
- Buenas practicas: tipado estricto, carpetas claras, escenas desacopladas, assets centralizados.

## Plan de trabajo propuesto
1. Inicializar el proyecto desde el template React + Phaser (TypeScript) y adaptar scripts base.
2. Definir la estructura de carpetas y el modelo de configuracion de variantes (1o/4o).
3. Crear gestor de assets y precarga en una escena base.
4. Implementar menu React con dos opciones y pasar la seleccion a Phaser.
5. Crear escena de juego basica con parallax (clouds + mountains).
6. Mostrar personaje seleccionado en idle (sprite y animacion).
7. Verificar render en desktop y mobile y documentar como extender a enemigos, items y pruebas.

## Notas para siguientes iteraciones
- El resto de diferencias entre variantes (fondos, preguntas, enemigos, items) se resolvera via configuracion.
- Mas adelante se agregaran mecanicas de salto, generacion de obstaculos, y logica de pruebas educativas.
