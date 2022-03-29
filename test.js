let texto = `
1058\. UN NUEVO CICLO MUCHO MÁS RESPONSABLE EN EL CONSEJO DE LOS DOCE
---------------------------------------------------------------------

![](https://storage.googleapis.com/tseyorimagenes/4952d4bf81a6919c8e3dc6f00c2866ee.png)  
  

**Universidad Tseyor de Granada (UTG) Granada (España)**

**CONVERSACIONES INTERDIMENSIONALES**

**Tarragona – Sala del Consejo de los doce (Paltalk)**

**Núm. 1058 jueves 21 de mayo 2020**

**[tseyor.org](https://tseyor.org/?fbclid=IwAR1jqYmtWIdR3LrDam9fEQmjWM-XGlFzmeH0yvI_26duAtlSTFfU4rKZk20)**

.

Hoy se ha reunido el Consejo de los doce 40 para ratificar la composición del nuevo Consejo de los doce 41, tras la decisión adoptada por el Ágora del Junantal de sustituir del mismo a la hermana Segundo Aviso La Pm, antiguamente Gallo que Piensa La Pm, que continúa en paréntesis, y aceptar la inclusión de la hermana Vuelve La Pm como miembro del nuevo Consejo de los doce 41. En esta reunión, Aumnor nos ha dado el siguiente comunicado.

.

![](https://storage.googleapis.com/tseyorimagenes/decoded.27a5d9d3938142cb575beb8fe6d6abc3.png)

**1058\.** **UN NUEVO CICLO MUCHO MÁS RESPONSABLE**

**EN EL CONSEJO DE LOS DOCE**

.

Hermanos, atlantes todos, Consejo de los doce, soy Aumnor.

Cierto que no podemos imbuir consciencia. La misma ha de aflorar en todos y cada uno de nosotros y establecerse mediante retroalimentación, creando esa energía vivificadora, regeneradora, y que ha de llevarnos a cumplir un compromiso.

También es cierto que cuando uno se ve atosigado, se ve presionado por el medio, por mil y un motivos, todos subjetivos por supuesto, cuando de lo que se trata es de dar prioridad a la espiritualidad, se deja este camino para atender otros quehaceres, tal vez importantes, pero olvidando que el más importante es la espiritualidad.

Porque de ella va a florecer la auténtica consciencia y el saber hacer, y el poder resolver además toda la problemática que, de otro modo, estamos confiando en que lo haga el propio ego, y él, en este punto, es incapaz de establecer concordancia, equilibrio, ecuanimidad, justicia… Entonces, mal vamos.

Esto es parecido al pez que se muerde la cola; vamos deprisa, corriendo, intentando resolver todos nuestros problemas. ¿Nos hemos dejado alguna cosa esta mañana, tal vez fregar los platos en la cocina o poner la lavadora? ¿Esto es más importante que sentarse tranquilamente y hacer un repaso en nuestra intimidad más profunda? Pues ciertamente es así, damos prioridad a lo que es secundario.

Y recordad, si damos prioridad a la consciencia, esta nos redimirá de todas aquellas obligaciones, del yugo que ellas representan en nosotros, que nos hacen andar como arrastrados.

En definitiva, sepamos sincronizar nuestras vidas y hagamos lo correcto. Ahora bien, ¿qué es lo correcto? Claro, en un estado abiótico lo correcto no lo sabemos, lo ignoramos, el ego no lo sabe, el ego lo ignora.

Pero, nuestra réplica no lo ignora, sí lo sabe, está constantemente al tanto de toda la situación y nos avisa y nos dice: oye, presta atención. Aviso para navegantes. Tal cual. ¡Atención! Pero, ante las prisas, ante la angustia, ante lo secundario, perdemos la noción de lo real, de lo efectivo, de lo objetivo, y así nos va.


`

const split_text = function (texto) {
  // limpia el texto
  texto = texto.replace(/ANEXOS.*/, '')
    .replace(/\!?\[([^\]]*)\]\([^\)]*\)/g, ' $1 ')
    .replace(/[\*\`\"\'\-\t\r]/g, ' ')

  const getField = (n) => 'texto' + (num == 1 ? '' : num)
  const cleanSpaces = (txt) => txt.replace(/\s{2,99}/g, ' ').replace(/^\s|\s$/g, '')
  const lines = texto.split(/\n/)
  const result = {}
  let current = []
  let num = 1
  console.log(lines)
  for (const line of lines) {
    const words = line.split(/\[\.\(\)\,]/)
    if (current.length + words.length >= 1000) {
      const field = getField(num)
      result[field] = cleanSpaces(current.join(' '))
      current = []
      num++
    }
    current = current.concat(words)
  }
  const field = getField(num)
  result[field] = cleanSpaces(current.join(' '))
  return result
}

console.log(split_text(texto))
