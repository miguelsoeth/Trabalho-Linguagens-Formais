import { Injectable } from '@angular/core';
import { Passos } from '../interfaces/passos';

@Injectable({
  providedIn: 'root'
})
export class GrammarResolverService {

  resolver(gramatica: Record<string, string[]>): Passos[] {
    const output: string[] = [];
    const pilha: string[] = [];
    const passos: Passos[] = [];

    const inicial = 'S';
    if (!gramatica[inicial]) {
      throw new Error(`Símbolo inicial '${inicial}' não encontrado na gramática.`);
    }

    const producaoInicial = this.getProducaoAleatoria(gramatica[inicial]);
    for (let i = 0; i < producaoInicial.length; i++) {
      pilha.push(producaoInicial[i]);
    }    
    passos.push({
      mensagem: `Inicial: S → ${producaoInicial}`,
      pilha: `[${[...pilha].join(', ')}]`,
      saida: `[${output.join('')}]`
    });

    while (pilha.length > 0) {
      const simbolo = pilha.pop()!;

      if (/^[a-z0-9~]$/.test(simbolo)) {
        if (simbolo !== '~') {
          output.push(simbolo);
          passos.push({
            mensagem: `Elemento terminal '${simbolo}' adicionado à saída`,
            pilha: `[${[...pilha].join(', ')}]`,
            saida: `[${output.join('')}]`
          });
        } else {
          passos.push({
            mensagem: `Elemento terminal vazio (~) removido`,
            pilha: `[${[...pilha].join(', ')}]`,
            saida: `[${output.join('')}]`
          });
        }
      } else if (/^[A-Z]$/.test(simbolo)) {
        const producoes = gramatica[simbolo];
        if (!producoes || producoes.length === 0) {
          throw new Error(`Sem produções para o símbolo não-terminal '${simbolo}'.`);
        }

        const producao = this.getProducaoAleatoria(producoes);
        for (let i = producao.length - 1; i >= 0; i--) {
          pilha.push(producao[i]);
        }
        passos.push({
          mensagem: `Elemento '${simbolo}' trocado por '${producao}'`,
          pilha: `[${[...pilha].join(', ')}]`,
          saida: `[${output.join('')}]`
        });
      } else {
        throw new Error(`Símbolo inválido encontrado na pilha: '${simbolo}'`);
      }
    }

    passos.push({
      mensagem: `Resultado final: ${output.join('')}`,
      pilha: `[ ]`,
      saida: `[${output.join('')}]`
    });
    return passos;
  }

  private getProducaoAleatoria(producoes: string[]): string {
    const index = Math.floor(Math.random() * producoes.length);
    return producoes[index];
  }
}
